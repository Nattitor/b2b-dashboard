"use client";

import { useId, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipContentProps,
} from "recharts";
import { formatMoney, formatMonth, formatMonthShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ChartPoint } from "@/lib/types";

function RevenueTooltip({
  active,
  payload,
}: Partial<TooltipContentProps<number, string>>) {
  const point = payload?.[0]?.payload as ChartPoint | undefined;
  if (!active || !point) return null;
  return (
    <div className="chart-tooltip">
      <p className="text-xs text-slate-300">{formatMonth(point.date)}</p>
      <p className="mt-1 font-mono text-base text-[#58e0ce]">
        {formatMoney(point.revenue)}
      </p>
    </div>
  );
}

export function RevenueChart({ data }: { data: ChartPoint[] }) {
  const [range, setRange] = useState(6);
  const gradient = useId().replace(/:/g, "");
  const visible = data.slice(-range);
  const total = visible.reduce((sum, point) => sum + point.revenue, 0);
  return (
    <section
      className="glass-panel chart-panel"
      aria-labelledby="revenue-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow mb-2">CASH FLOW</div>
          <h2 id="revenue-heading" className="section-title">
            Revenue performance
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Successful collections · USD · UTC
          </p>
        </div>
        <div
          className="segmented"
          role="group"
          aria-label="Revenue chart period"
        >
          {[6, 12].map((months) => (
            <button
              key={months}
              type="button"
              aria-pressed={range === months}
              onClick={() => setRange(months)}
              className={cn(range === months && "selected")}
            >
              {months} months
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-mono text-[1.65rem] font-semibold tracking-tight text-white">
          {formatMoney(total)}
        </p>
        <span className="text-xs text-slate-400">collected in this view</span>
      </div>
      <div
        className="chart-canvas mt-6"
        role="img"
        aria-label={`Revenue for the last ${range} months. Total ${formatMoney(total)}. Exact monthly values follow in the data table.`}
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart
            data={visible}
            margin={{ top: 12, right: 8, left: -12, bottom: 4 }}
            accessibilityLayer
          >
            <defs>
              <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#58e0ce" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#58e0ce" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="#26313b"
              strokeDasharray="3 5"
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatMonthShort}
              axisLine={false}
              tickLine={false}
              minTickGap={20}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              dy={8}
            />
            <YAxis
              width={56}
              tickFormatter={(value: number) =>
                value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`
              }
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />
            <Tooltip
              content={<RevenueTooltip />}
              cursor={{ stroke: "#71929f", strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Collected"
              stroke="#58e0ce"
              strokeWidth={2.5}
              fill={`url(#${gradient})`}
              isAnimationActive={false}
              activeDot={{
                r: 5,
                fill: "#58e0ce",
                stroke: "#0b1017",
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#24303b] pt-4 text-xs text-slate-400">
        <span className="inline-flex items-center gap-2">
          <span
            className="size-1.5 rounded-full bg-[#58e0ce]"
            aria-hidden="true"
          />
          Collected revenue
        </span>
        <span>Latest month is month to date</span>
      </div>
      <details className="data-details mt-4">
        <summary>View monthly data</summary>
        <table className="mt-3 w-full text-left text-xs">
          <caption className="sr-only">
            Monthly collected revenue in US dollars
          </caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col" className="text-right">
                Collected
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((point) => (
              <tr key={point.date}>
                <th scope="row" className="py-2 font-normal text-slate-300">
                  {formatMonth(point.date)}
                </th>
                <td className="text-right font-mono text-slate-200">
                  {formatMoney(point.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
