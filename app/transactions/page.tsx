import type { Metadata } from "next";
import { ArrowLeftRight } from "lucide-react";
import { redirect } from "next/navigation";
import { getLedger } from "@/lib/data";
import { ledgerSearchParams, parseLedgerFilters } from "@/lib/filters";
import type { SearchParams } from "@/lib/types";
import { DataTable } from "@/components/dashboard/DataTable";

export const revalidate = 0;
export const metadata: Metadata = { title: "Transactions" };

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filters = parseLedgerFilters(params);
  const result = await getLedger(filters);
  const canonical = ledgerSearchParams({ ...filters, page: result.page });
  const incoming = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") incoming.set(key, value);
    else if (Array.isArray(value))
      value.forEach((item) => incoming.append(key, item));
  }
  if (incoming.toString() !== canonical)
    redirect(`/transactions${canonical ? `?${canonical}` : ""}`);
  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow mb-3">WORKSPACE / TRANSACTIONS</p>
          <h1>
            Every movement, accounted for
            <span className="text-[#58e0ce]">.</span>
          </h1>
          <p className="page-description">
            Find a payment, follow up on a collection, or export the current
            page.
          </p>
        </div>
        <div className="date-pill">
          <ArrowLeftRight
            className="size-4 text-[#58e0ce]"
            aria-hidden="true"
          />
          Transaction ledger
        </div>
      </div>
      <div className="source-note">
        <span className="source-dot" aria-hidden="true" />
        <span>Local SQLite · synthetic transactions</span>
        <span className="sm:ml-auto">Amounts in USD · Dates in UTC</span>
      </div>
      <DataTable key={canonical} result={result} filters={filters} />
      <p className="page-footnote">
        Search matches transaction IDs, customer names, and email addresses. CSV
        export includes only the rows on the current page.
      </p>
    </div>
  );
}
