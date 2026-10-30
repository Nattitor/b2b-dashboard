import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CircleCheck,
  CreditCard,
  Users,
} from "lucide-react";
import { getDashboardSnapshot } from "@/lib/data";
import {
  formatCount,
  formatDate,
  formatMoney,
  formatMonth,
} from "@/lib/format";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

export const revalidate = 0;

export default async function DashboardPage() {
  const data = await getDashboardSnapshot();
  const atRisk = data.pendingAmount + data.failedAmount;
  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow mb-3">WORKSPACE / OVERVIEW</p>
          <h1>
            Your business, in focus<span className="text-[#58e0ce]">.</span>
          </h1>
          <p className="page-description">
            A clear view of revenue, customers, and what needs your attention.
          </p>
        </div>
        <div className="date-pill">
          <CalendarDays className="size-4 text-[#58e0ce]" aria-hidden="true" />
          {formatMonth(data.asOf)}
          <span className="text-slate-400">MTD</span>
        </div>
      </div>
      <div className="source-note">
        <span className="source-dot" aria-hidden="true" />
        <span>Local SQLite · synthetic data</span>
        <span className="sm:ml-auto">As of {formatDate(data.asOf)} · USD</span>
      </div>
      <div className="kpi-grid">
        <KpiCard
          title="Collected revenue"
          value={formatMoney(data.revenue)}
          growth={data.revenueGrowth}
          note="vs. previous period"
          icon={<ArrowDownLeft className="size-4" />}
          featured
        />
        <KpiCard
          title="Successful payments"
          value={formatCount(data.successfulPayments)}
          growth={data.paymentGrowth}
          note="vs. previous period"
          icon={<CreditCard className="size-4" />}
        />
        <KpiCard
          title="Active customers"
          value={formatCount(data.activeCustomers)}
          note={`${data.newCustomers} new customers this month`}
          icon={<Users className="size-4" />}
        />
        <KpiCard
          title="Payment success"
          value={`${data.successRate.toFixed(1)}%`}
          growth={data.rateChange}
          suffix=" pp"
          note="vs. previous period"
          icon={<CircleCheck className="size-4" />}
        />
      </div>
      <div className="overview-grid">
        <RevenueChart data={data.chart} />
        <section
          className="glass-panel plan-panel"
          aria-labelledby="plan-heading"
        >
          <div className="eyebrow mb-2">REVENUE COMPOSITION</div>
          <h2 id="plan-heading" className="section-title">
            The plan breakdown
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Share of collected revenue this month
          </p>
          <div className="plan-orbit" aria-hidden="true">
            <div className="orbit-line" />
            <div className="orbit-line orbit-line-two" />
            <div className="orbit-core">
              <span className="text-[10px] uppercase tracking-[.18em] text-slate-400">
                COLLECTED
              </span>
              <strong className="mt-1 font-mono text-lg text-white">
                {formatMoney(data.revenue)}
              </strong>
            </div>
            <span className="orbit-point" />
          </div>
          <div className="space-y-5">
            {data.plans.length === 0 ? (
              <p className="text-sm text-slate-400">
                No successful collections this month.
              </p>
            ) : (
              data.plans.map((plan, index) => {
                const share = data.revenue
                  ? (plan.revenue / data.revenue) * 100
                  : 0;
                return (
                  <div key={plan.name}>
                    <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                      <span className="inline-flex items-center gap-2 text-slate-200">
                        <span
                          className={`plan-dot plan-color-${index % 3}`}
                          aria-hidden="true"
                        />
                        {plan.name}
                      </span>
                      <span className="font-mono text-xs text-slate-300">
                        {share.toFixed(1)}%
                      </span>
                    </div>
                    <div
                      className="plan-track"
                      role="meter"
                      aria-label={`${plan.name} revenue share`}
                      aria-valuenow={Number(share.toFixed(1))}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <span
                        className={`plan-color-${index % 3}`}
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-right font-mono text-[11px] text-slate-400">
                      {formatMoney(plan.revenue)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
      <section
        id="collection-watch"
        className="collection-watch"
        aria-labelledby="watch-heading"
      >
        <div className="watch-icon" aria-hidden="true">
          <ArrowUpRight className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="eyebrow text-amber-200!">COLLECTION WATCH</p>
          <h2 id="watch-heading" className="mt-2 text-lg font-semibold">
            {atRisk > 0
              ? `${formatMoney(atRisk)} still needs a closer look`
              : "All clear. Every payment is accounted for."}
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            {data.pendingCount} pending ({formatMoney(data.pendingAmount)}) ·{" "}
            {data.failedCount} failed ({formatMoney(data.failedAmount)}) this
            month. Review individual records in the ledger.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/transactions?status=Pending"
            className="button-secondary"
          >
            Review pending <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link href="/transactions?status=Failed" className="button-quiet">
            View failed
          </Link>
        </div>
      </section>
      <section
        className="glass-panel recent-panel"
        aria-labelledby="recent-heading"
      >
        <div className="panel-heading">
          <div>
            <p className="eyebrow mb-2">LATEST MOVEMENTS</p>
            <h2 id="recent-heading" className="section-title">
              Recent transactions
            </h2>
          </div>
          <Link href="/transactions" className="text-link">
            View ledger <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="recent-list">
          {data.recentTransactions.map((transaction) => (
            <li key={transaction.id}>
              <div className="company-avatar" aria-hidden="true">
                {transaction.customer.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/transactions?q=${encodeURIComponent(transaction.id)}`}
                  className="truncate text-sm font-medium text-slate-100 underline-offset-4 hover:underline"
                >
                  {transaction.customer.name}
                </Link>
                <p className="mt-1 text-xs text-slate-400">
                  {transaction.plan} · {formatDate(transaction.created_at)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-8">
                <span className="font-mono text-sm text-white">
                  {formatMoney(transaction.amount)}
                </span>
                <StatusBadge status={transaction.status} />
              </div>
            </li>
          ))}
        </ul>
        {data.recentTransactions.length === 0 && (
          <p className="p-6 text-sm text-slate-400">No transactions yet.</p>
        )}
      </section>
      <p className="page-footnote">
        Month-to-date comparisons use the same elapsed time in the previous
        month, capped at that month’s end. Collections are not MRR. Read-only
        workspace.
      </p>
    </div>
  );
}
