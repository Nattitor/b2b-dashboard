import {
  transactionStatuses,
  type LedgerFilters,
  type SearchParams,
} from "./types";

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export function parseLedgerFilters(params: SearchParams): LedgerFilters {
  const rawPage = first(params.page) ?? "1";
  const page = /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  const status = first(params.status);
  return {
    page: Number.isSafeInteger(page) && page > 0 ? Math.min(page, 100_000) : 1,
    pageSize: 10,
    sortBy: first(params.sortBy) === "amount" ? "amount" : "created_at",
    order: first(params.order) === "asc" ? "asc" : "desc",
    query: (first(params.q) ?? "").trim().slice(0, 100),
    status: transactionStatuses.find((item) => item === status) ?? "All",
  };
}

export function ledgerSearchParams(filters: LedgerFilters): string {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.status !== "All") params.set("status", filters.status);
  if (filters.sortBy !== "created_at") params.set("sortBy", filters.sortBy);
  if (filters.order !== "desc") params.set("order", filters.order);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

export function growth(current: number, previous: number): number | null {
  return previous === 0
    ? current === 0
      ? 0
      : null
    : ((current - previous) / previous) * 100;
}
