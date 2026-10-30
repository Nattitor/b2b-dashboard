import type { DatabaseSync, SQLOutputValue } from "node:sqlite";
import { growth } from "./filters";
import {
  parseLedgerResult,
  parseSnapshot,
  parseTransaction,
} from "./validation";
import { transactionStatuses, type LedgerFilters } from "./types";

type Row = Record<string, SQLOutputValue>;

function number(value: SQLOutputValue | undefined): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0)
    throw new Error("Invalid local aggregate");
  return value;
}

function readTransaction<T>(database: DatabaseSync, read: () => T): T {
  database.exec("BEGIN");
  try {
    const result = read();
    database.exec("COMMIT");
    return result;
  } catch (error) {
    if (database.isTransaction) database.exec("ROLLBACK");
    throw error;
  }
}

const transactionColumns = `
  t.id, t.amount_cents / 100.0 AS amount, t.status, t.created_at,
  c.name AS customer_name, c.email AS customer_email, p.plan_name AS plan
`;
const transactionTables = `transactions t
  JOIN customers c ON c.id = t.customer_id
  JOIN plans p ON p.id = t.plan_id`;

function transaction(row: Row) {
  return parseTransaction({
    id: row.id,
    amount: row.amount,
    status: row.status,
    created_at: row.created_at,
    customer: { name: row.customer_name, email: row.customer_email },
    plan: row.plan,
  });
}

export function readLocalSnapshot(database: DatabaseSync) {
  return readTransaction(database, () => {
    const storedDate = database
      .prepare("SELECT value FROM metadata WHERE key = 'as_of'")
      .get()?.value;
    if (
      typeof storedDate !== "string" ||
      !Number.isFinite(Date.parse(storedDate))
    )
      throw new Error("Invalid local snapshot date");
    const now = new Date(storedDate);
    const asOf = now.toISOString();
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const previousStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
    );
    const previousEnd = new Date(
      Math.min(
        start.getTime(),
        previousStart.getTime() + now.getTime() - start.getTime(),
      ),
    );
    const nextStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );
    const periodQuery = database.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'Success' THEN amount_cents ELSE 0 END), 0) AS revenue,
        COUNT(*) AS payments,
        COALESCE(SUM(status = 'Success'), 0) AS successful,
        COALESCE(SUM(CASE WHEN status = 'Pending' THEN amount_cents ELSE 0 END), 0) AS pending_amount,
        COALESCE(SUM(status = 'Pending'), 0) AS pending_count,
        COALESCE(SUM(CASE WHEN status = 'Failed' THEN amount_cents ELSE 0 END), 0) AS failed_amount,
        COALESCE(SUM(status = 'Failed'), 0) AS failed_count
      FROM transactions WHERE created_at >= ? AND created_at <= ? AND created_at < ?
    `);
    const current = periodQuery.get(
      start.toISOString(),
      asOf,
      nextStart.toISOString(),
    )!;
    const previous = periodQuery.get(
      previousStart.toISOString(),
      previousEnd.toISOString(),
      start.toISOString(),
    )!;
    const paid = number(current.successful);
    const previousPaid = number(previous.successful);
    const count = number(current.payments);
    const previousCount = number(previous.payments);
    const rate = count ? (100 * paid) / count : 0;
    const previousRate = previousCount
      ? (100 * previousPaid) / previousCount
      : 0;
    const customers = database
      .prepare(
        `
      SELECT
        COALESCE(SUM(status = 'Active' AND created_at <= ?), 0) AS active,
        COALESCE(SUM(created_at >= ? AND created_at <= ?), 0) AS acquired
      FROM customers
    `,
      )
      .get(asOf, start.toISOString(), asOf)!;
    const chart = Array.from({ length: 12 }, (_, index) => ({
      date: new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + index, 1),
      ).toISOString(),
      revenue: 0,
    }));
    const months = new Map(
      database
        .prepare(
          `
      SELECT substr(created_at, 1, 7) AS month, SUM(amount_cents) AS revenue
      FROM transactions WHERE status = 'Success' AND created_at >= ? AND created_at <= ?
      GROUP BY month
    `,
        )
        .all(chart[0].date, asOf)
        .map((row) => [row.month, number(row.revenue) / 100]),
    );
    for (const point of chart)
      point.revenue = months.get(point.date.slice(0, 7)) ?? 0;
    const plans = database
      .prepare(
        `
      SELECT p.plan_name AS name, SUM(t.amount_cents) AS revenue, COUNT(*) AS payments
      FROM transactions t JOIN plans p ON p.id = t.plan_id
      WHERE t.status = 'Success' AND t.created_at >= ? AND t.created_at <= ?
      GROUP BY p.id, p.plan_name ORDER BY revenue DESC, p.plan_name ASC LIMIT 101
    `,
      )
      .all(start.toISOString(), asOf)
      .map((row) => ({
        name: row.name,
        revenue: number(row.revenue) / 100,
        transactions: number(row.payments),
      }));
    const recentTransactions = database
      .prepare(
        `
      SELECT ${transactionColumns} FROM ${transactionTables}
      WHERE t.created_at <= ? ORDER BY t.created_at DESC, t.id ASC LIMIT 5
    `,
      )
      .all(asOf)
      .map(transaction);
    return parseSnapshot({
      asOf,
      revenue: number(current.revenue) / 100,
      revenueGrowth: growth(
        number(current.revenue) / 100,
        number(previous.revenue) / 100,
      ),
      successfulPayments: paid,
      paymentGrowth: growth(paid, previousPaid),
      activeCustomers: number(customers.active),
      newCustomers: number(customers.acquired),
      successRate: rate,
      rateChange: rate - previousRate,
      pendingAmount: number(current.pending_amount) / 100,
      pendingCount: number(current.pending_count),
      failedAmount: number(current.failed_amount) / 100,
      failedCount: number(current.failed_count),
      chart,
      plans,
      recentTransactions,
    });
  });
}

export function readLocalLedger(
  database: DatabaseSync,
  filters: LedgerFilters,
) {
  if (
    !Number.isSafeInteger(filters.page) ||
    filters.page < 1 ||
    filters.page > 100_000 ||
    filters.pageSize !== 10 ||
    !["created_at", "amount"].includes(filters.sortBy) ||
    !["asc", "desc"].includes(filters.order) ||
    (filters.status !== "All" &&
      !transactionStatuses.includes(filters.status)) ||
    typeof filters.query !== "string" ||
    filters.query.length > 100
  )
    throw new Error("Invalid ledger parameters");
  return readTransaction(database, () => {
    const query = filters.query.toLocaleLowerCase("en-US");
    const parameters = [
      filters.status,
      filters.status,
      query,
      query,
      query,
      query,
    ];
    const where = `(? = 'All' OR t.status = ?) AND
      (? = '' OR instr(search_fold(t.id), ?) > 0 OR instr(search_fold(c.name), ?) > 0 OR instr(search_fold(c.email), ?) > 0)`;
    const totalCount = number(
      database
        .prepare(
          `
      SELECT COUNT(*) AS count FROM ${transactionTables} WHERE ${where}
    `,
        )
        .get(...parameters)?.count,
    );
    const page = Math.min(
      filters.page,
      Math.max(1, Math.ceil(totalCount / filters.pageSize)),
    );
    // These identifiers come only from the validated allowlists above.
    const column =
      filters.sortBy === "amount" ? "t.amount_cents" : "t.created_at";
    const order = filters.order === "asc" ? "ASC" : "DESC";
    const data = database
      .prepare(
        `
      SELECT ${transactionColumns} FROM ${transactionTables} WHERE ${where}
      ORDER BY ${column} ${order}, t.id ASC LIMIT ? OFFSET ?
    `,
      )
      .all(...parameters, filters.pageSize, (page - 1) * filters.pageSize)
      .map(transaction);
    return parseLedgerResult({
      data,
      totalCount,
      page,
      pageSize: filters.pageSize,
    });
  });
}
