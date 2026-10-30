import {
  transactionStatuses,
  type DashboardSnapshot,
  type LedgerResult,
  type Transaction,
} from "./types";

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid data response");
  return value as Record<string, unknown>;
}
function number(value: unknown, signed = false): number {
  const result =
    typeof value === "string" && value.trim() ? Number(value) : value;
  if (
    typeof result !== "number" ||
    !Number.isFinite(result) ||
    (!signed && result < 0)
  )
    throw new Error("Invalid numeric data");
  return result;
}
function text(value: unknown, maximum = 255): string {
  if (typeof value !== "string" || value.length > maximum)
    throw new Error("Invalid text data");
  return value;
}
function date(value: unknown): string {
  const result = text(value, 40);
  if (!Number.isFinite(Date.parse(result)))
    throw new Error("Invalid date data");
  return new Date(result).toISOString();
}
function list(value: unknown, maximum: number): unknown[] {
  if (!Array.isArray(value) || value.length > maximum)
    throw new Error("Invalid list data");
  return value;
}
export function parseTransaction(value: unknown): Transaction {
  const row = object(value);
  const customer = object(row.customer);
  const status = transactionStatuses.find((item) => item === row.status);
  if (!status) throw new Error("Invalid transaction status");
  return {
    id: text(row.id, 64),
    amount: number(row.amount),
    status,
    created_at: date(row.created_at),
    customer: { name: text(customer.name), email: text(customer.email) },
    plan: text(row.plan, 100),
  };
}
export function parseLedgerResult(value: unknown): LedgerResult {
  const row = object(value);
  const result = {
    data: list(row.data, 10).map(parseTransaction),
    totalCount: number(row.totalCount),
    page: number(row.page),
    pageSize: number(row.pageSize),
  };
  if (
    ![result.totalCount, result.page, result.pageSize].every(
      Number.isSafeInteger,
    ) ||
    result.page < 1 ||
    result.pageSize !== 10
  )
    throw new Error("Invalid pagination data");
  return result;
}
export function parseSnapshot(value: unknown): DashboardSnapshot {
  const row = object(value);
  const nullableGrowth = (value: unknown) =>
    value === null ? null : number(value, true);
  return {
    asOf: date(row.asOf),
    revenue: number(row.revenue),
    revenueGrowth: nullableGrowth(row.revenueGrowth),
    successfulPayments: number(row.successfulPayments),
    paymentGrowth: nullableGrowth(row.paymentGrowth),
    activeCustomers: number(row.activeCustomers),
    newCustomers: number(row.newCustomers),
    successRate: number(row.successRate),
    rateChange: number(row.rateChange, true),
    pendingAmount: number(row.pendingAmount),
    pendingCount: number(row.pendingCount),
    failedAmount: number(row.failedAmount),
    failedCount: number(row.failedCount),
    chart: list(row.chart, 12).map((value) => {
      const point = object(value);
      return { date: date(point.date), revenue: number(point.revenue) };
    }),
    plans: list(row.plans, 100).map((value) => {
      const plan = object(value);
      return {
        name: text(plan.name, 100),
        revenue: number(plan.revenue),
        transactions: number(plan.transactions),
      };
    }),
    recentTransactions: list(row.recentTransactions, 5).map(parseTransaction),
  };
}
