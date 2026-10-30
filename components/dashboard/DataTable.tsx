"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Search,
  X,
} from "lucide-react";
import { ledgerSearchParams } from "@/lib/filters";
import { formatDate, formatMoney } from "@/lib/format";
import type { LedgerFilters, LedgerResult, Transaction } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

function CopyId({ id }: { id: string }) {
  const [message, setMessage] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(id);
      setMessage("Copied");
    } catch {
      setMessage("Copy unavailable. Select the ID below.");
    }
  }
  return (
    <div className="transaction-id">
      <span title={id} className="font-mono text-[11px] text-slate-400">
        {id.slice(0, 8)}…{id.slice(-4)}
      </span>
      <button
        type="button"
        className="icon-button"
        aria-label={`Copy transaction ID ${id}`}
        onClick={copy}
      >
        {message === "Copied" ? (
          <Check className="size-3.5 text-emerald-300" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
      </button>
      <span className="sr-only" role="status">
        {message}
      </span>
      {message.startsWith("Copy unavailable") && (
        <span className="break-all text-xs">{id}</span>
      )}
    </div>
  );
}

function csvCell(value: string | number): string {
  const raw = String(value);
  // Quoting alone does not neutralize spreadsheet formulas.
  const safe = /^[\s\u0000-\u001f]*[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

function exportPage(data: Transaction[]) {
  const rows = [
    [
      "Transaction ID",
      "Customer",
      "Email",
      "Plan",
      "Amount USD",
      "Status",
      "Created UTC",
    ],
    ...data.map((item) => [
      item.id,
      item.customer.name,
      item.customer.email,
      item.plan,
      item.amount.toFixed(2),
      item.status,
      item.created_at,
    ]),
  ];
  const blob = new Blob(
    ["\ufeff" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n")],
    { type: "text/csv;charset=utf-8;" },
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "nattitor-transactions-page.csv";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function SortIcon({
  column,
  filters,
}: {
  column: LedgerFilters["sortBy"];
  filters: LedgerFilters;
}) {
  const Icon =
    filters.sortBy !== column
      ? ArrowUpDown
      : filters.order === "asc"
        ? ArrowUp
        : ArrowDown;
  return <Icon className="size-3.5" aria-hidden="true" />;
}

export function DataTable({
  result,
  filters,
}: {
  result: LedgerResult;
  filters: LedgerFilters;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(filters.query);
  const [pending, startTransition] = useTransition();
  const totalPages = Math.max(
    1,
    Math.ceil(result.totalCount / result.pageSize),
  );
  function href(patch: Partial<LedgerFilters>) {
    const params = ledgerSearchParams({
      ...filters,
      page: result.page,
      ...patch,
    });
    return `/transactions${params ? `?${params}` : ""}`;
  }
  function change(patch: Partial<LedgerFilters>, replace = false) {
    const target = href(patch);
    startTransition(() =>
      replace
        ? router.replace(target, { scroll: false })
        : router.push(target, { scroll: false }),
    );
  }
  function sort(column: LedgerFilters["sortBy"]) {
    change({
      page: 1,
      sortBy: column,
      order:
        filters.sortBy === column && filters.order === "desc" ? "asc" : "desc",
    });
  }
  return (
    <section
      className="glass-panel ledger-panel"
      aria-label="Transaction ledger"
      aria-busy={pending}
    >
      <div className="ledger-toolbar">
        <form
          className="ledger-search"
          role="search"
          aria-label="Filter ledger"
          onSubmit={(event) => {
            event.preventDefault();
            change({ page: 1, query: query.trim().slice(0, 100) });
          }}
        >
          <label htmlFor="ledger-query" className="sr-only">
            Search by transaction ID, customer or email
          </label>
          <Search
            className="size-4 shrink-0 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="ledger-query"
            type="search"
            value={query}
            maxLength={100}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ID, customer, or email"
          />
          <button type="submit" className="search-submit">
            Search
          </button>
        </form>
        <button
          type="button"
          onClick={() => exportPage(result.data)}
          disabled={!result.data.length || pending}
          className="button-secondary"
        >
          <Download className="size-4" aria-hidden="true" />
          Export page
        </button>
      </div>
      <div className="ledger-filters">
        <div
          className="status-filters"
          role="group"
          aria-label="Payment status"
        >
          {(["All", "Success", "Pending", "Failed"] as const).map((status) => (
            <button
              key={status}
              type="button"
              disabled={pending}
              aria-pressed={filters.status === status}
              onClick={() => change({ page: 1, status })}
              className={cn(filters.status === status && "selected")}
            >
              {status === "Success" ? "Paid" : status}
              {filters.status === status && (
                <span className="filter-count">{result.totalCount}</span>
              )}
            </button>
          ))}
        </div>
        <div className="mobile-sort">
          <label htmlFor="mobile-sort" className="sr-only">
            Sort transactions
          </label>
          <select
            id="mobile-sort"
            value={`${filters.sortBy}:${filters.order}`}
            onChange={(event) => {
              const [sortBy, order] = event.target.value.split(":");
              change({
                page: 1,
                sortBy: sortBy === "amount" ? "amount" : "created_at",
                order: order === "asc" ? "asc" : "desc",
              });
            }}
          >
            <option value="created_at:desc">Newest first</option>
            <option value="created_at:asc">Oldest first</option>
            <option value="amount:desc">Highest amount</option>
            <option value="amount:asc">Lowest amount</option>
          </select>
        </div>
      </div>
      {filters.query && (
        <div className="active-query">
          <span>
            Results for <strong className="break-all">“{filters.query}”</strong>
          </span>
          <button
            type="button"
            className="button-quiet"
            onClick={() => {
              setQuery("");
              change({ query: "", page: 1 });
            }}
          >
            <X className="size-3.5" aria-hidden="true" />
            Clear search
          </button>
        </div>
      )}
      <p
        role="status"
        aria-label="Ledger results"
        className={pending ? "px-5 py-2 text-xs text-[#58e0ce]" : "sr-only"}
      >
        {pending
          ? "Updating transactions…"
          : `${result.totalCount} transactions found. Page ${result.page} of ${totalPages}.`}
      </p>
      {result.data.length > 0 ? (
        <>
          <div className={cn("desktop-ledger", pending && "opacity-60")}>
            <table>
              <caption className="sr-only">
                Transactions in US dollars. Dates in UTC. Sort by amount or date
                using the column buttons.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Customer / Transaction</th>
                  <th scope="col">Plan</th>
                  <th
                    scope="col"
                    className="text-right"
                    aria-sort={
                      filters.sortBy === "amount"
                        ? filters.order === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <button type="button" onClick={() => sort("amount")}>
                      Amount <SortIcon column="amount" filters={filters} />
                    </button>
                  </th>
                  <th scope="col">Status</th>
                  <th
                    scope="col"
                    aria-sort={
                      filters.sortBy === "created_at"
                        ? filters.order === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <button type="button" onClick={() => sort("created_at")}>
                      Date <SortIcon column="created_at" filters={filters} />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="company-avatar" aria-hidden="true">
                          {transaction.customer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p
                            className="customer-name"
                            title={transaction.customer.email}
                          >
                            {transaction.customer.name}
                          </p>
                          <CopyId id={transaction.id} />
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-300">{transaction.plan}</td>
                    <td className="text-right font-mono text-slate-100">
                      {formatMoney(transaction.amount)}
                    </td>
                    <td>
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="whitespace-nowrap text-xs text-slate-400">
                      {formatDate(transaction.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className={cn("mobile-ledger", pending && "opacity-60")}>
            {result.data.map((transaction) => (
              <li key={transaction.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium text-slate-100">
                      {transaction.customer.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {transaction.plan} · {formatDate(transaction.created_at)}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-sm text-white">
                    {formatMoney(transaction.amount)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <CopyId id={transaction.id} />
                  <StatusBadge status={transaction.status} />
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="empty-state">
          <Search className="size-7 text-slate-400" aria-hidden="true" />
          <h2>No matching transactions</h2>
          <p>Try a different ID, customer, or payment status.</p>
          <Link href="/transactions" className="button-secondary">
            Reset all filters
          </Link>
        </div>
      )}
      <footer className="ledger-pagination">
        <p>
          {result.totalCount === 0
            ? "0 transactions"
            : `${(result.page - 1) * result.pageSize + 1}–${Math.min(result.page * result.pageSize, result.totalCount)} of ${result.totalCount} transactions`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="icon-button"
            aria-label="Previous page"
            disabled={result.page <= 1 || pending}
            onClick={() => change({ page: result.page - 1 })}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <span className="min-w-16 text-center font-mono text-xs text-slate-300">
            {result.page} / {totalPages}
          </span>
          <button
            type="button"
            className="icon-button"
            aria-label="Next page"
            disabled={result.page >= totalPages || pending}
            onClick={() => change({ page: result.page + 1 })}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </footer>
    </section>
  );
}
