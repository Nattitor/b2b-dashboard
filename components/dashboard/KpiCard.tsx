import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  growth?: number | null;
  suffix?: string;
  note: string;
  icon: ReactNode;
  featured?: boolean;
}

export function KpiCard({
  title,
  value,
  growth,
  suffix = "%",
  note,
  icon,
  featured,
}: KpiCardProps) {
  const Direction =
    growth && growth < 0 ? ArrowDownRight : growth === 0 ? Minus : ArrowUpRight;
  return (
    <article className={cn("kpi-card glass-panel", featured && "kpi-featured")}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm text-slate-400">{title}</h2>
        <span className="kpi-icon" aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className="kpi-value">{value}</p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {growth !== undefined &&
          (growth === null ? (
            <span className="text-slate-300">New baseline</span>
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                growth < 0
                  ? "text-rose-300"
                  : growth > 0
                    ? "text-emerald-300"
                    : "text-slate-300",
              )}
            >
              <Direction className="size-3.5" aria-hidden="true" />
              {growth > 0 ? "+" : ""}
              {growth.toFixed(1)}
              {suffix}
            </span>
          ))}
        <span className="text-slate-400">{note}</span>
      </div>
    </article>
  );
}
