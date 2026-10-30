import { growth } from "./filters";
import type {
  DashboardSnapshot,
  Dataset,
  LedgerFilters,
  LedgerResult,
  Transaction,
} from "./types";

const sum = (items: Transaction[]) =>
  items.reduce((total, item) => total + Math.round(item.amount * 100), 0) / 100;

export function buildSnapshot(
  dataset: Dataset,
  asOf: string,
): DashboardSnapshot {
  const now = new Date(asOf);
  if (!Number.isFinite(now.getTime())) throw new Error("Invalid snapshot date");
  asOf = now.toISOString();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const previousStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
  );
  const previousEnd = new Date(
    Math.min(
      start.getTime(),
      previousStart.getTime() + (now.getTime() - start.getTime()),
    ),
  );
  const current = dataset.transactions.filter(
    (item) => item.created_at >= start.toISOString() && item.created_at <= asOf,
  );
  const previous = dataset.transactions.filter(
    (item) =>
      item.created_at >= previousStart.toISOString() &&
      item.created_at < start.toISOString() &&
      item.created_at <= previousEnd.toISOString(),
  );
  const paid = current.filter((item) => item.status === "Success");
  const previousPaid = previous.filter((item) => item.status === "Success");
  const pending = current.filter((item) => item.status === "Pending");
  const failed = current.filter((item) => item.status === "Failed");
  const rate = current.length ? (100 * paid.length) / current.length : 0;
  const previousRate = previous.length
    ? (100 * previousPaid.length) / previous.length
    : 0;
  const chart = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + index, 1),
    );
    return { date: date.toISOString(), revenue: 0 };
  });
  const chartByMonth = new Map(
    chart.map((point) => [point.date.slice(0, 7), point]),
  );
  for (const item of dataset.transactions) {
    if (item.status !== "Success" || item.created_at > asOf) continue;
    const point = chartByMonth.get(item.created_at.slice(0, 7));
    if (point)
      point.revenue = Math.round((point.revenue + item.amount) * 100) / 100;
  }
  const plans = new Map<
    string,
    { name: string; revenue: number; transactions: number }
  >();
  for (const item of paid) {
    const plan = plans.get(item.plan) ?? {
      name: item.plan,
      revenue: 0,
      transactions: 0,
    };
    plan.revenue = Math.round((plan.revenue + item.amount) * 100) / 100;
    plan.transactions++;
    plans.set(item.plan, plan);
  }
  return {
    asOf,
    revenue: sum(paid),
    revenueGrowth: growth(sum(paid), sum(previousPaid)),
    successfulPayments: paid.length,
    paymentGrowth: growth(paid.length, previousPaid.length),
    activeCustomers: dataset.customers.filter(
      (item) => item.status === "Active" && item.created_at <= asOf,
    ).length,
    newCustomers: dataset.customers.filter(
      (item) =>
        item.created_at >= start.toISOString() && item.created_at <= asOf,
    ).length,
    successRate: rate,
    rateChange: rate - previousRate,
    pendingAmount: sum(pending),
    pendingCount: pending.length,
    failedAmount: sum(failed),
    failedCount: failed.length,
    chart,
    plans: [...plans.values()].sort((a, b) => b.revenue - a.revenue),
    recentTransactions: dataset.transactions
      .filter((item) => item.created_at <= asOf)
      .sort(
        (a, b) =>
          b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id),
      )
      .slice(0, 5),
  };
}

export function filterLedger(
  transactions: Transaction[],
  filters: LedgerFilters,
): LedgerResult {
  const query = filters.query.toLocaleLowerCase("en-US");
  const matches = transactions.filter(
    (item) =>
      (filters.status === "All" || item.status === filters.status) &&
      (!query ||
        [item.id, item.customer.name, item.customer.email].some((value) =>
          value.toLocaleLowerCase("en-US").includes(query),
        )),
  );
  matches.sort((a, b) => {
    const comparison =
      filters.sortBy === "amount"
        ? a.amount - b.amount
        : a.created_at.localeCompare(b.created_at);
    return (
      (filters.order === "asc" ? comparison : -comparison) ||
      a.id.localeCompare(b.id)
    );
  });
  const page = Math.min(
    filters.page,
    Math.max(1, Math.ceil(matches.length / filters.pageSize)),
  );
  return {
    data: matches.slice((page - 1) * filters.pageSize, page * filters.pageSize),
    totalCount: matches.length,
    page,
    pageSize: filters.pageSize,
  };
}
