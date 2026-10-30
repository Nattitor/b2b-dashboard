"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, LayoutDashboard } from "lucide-react";
import { Brand } from "@/components/brand/Brand";

const navItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-[#24303b] bg-[#0b1017] md:flex">
      <div className="flex h-20 shrink-0 items-center border-b border-[#24303b] px-5">
        <Brand />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-6">
        <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Workspace
        </div>
        <div className="mb-5 rounded-lg border border-[#24303b] bg-[#111923] px-3 py-3">
          <p className="truncate text-sm font-medium text-slate-200">
            Nattitor
          </p>
          <p className="mt-1 text-xs text-slate-400">Business operations</p>
        </div>

        <nav aria-label="Primary navigation" className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`group flex min-h-11 items-center gap-3 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58e0ce] ${
                  isActive
                    ? "border-[#58e0ce]/25 bg-[#58e0ce]/10 text-[#58e0ce]"
                    : "border-transparent text-slate-400 hover:border-[#24303b] hover:bg-[#111923] hover:text-slate-100"
                }`}
              >
                <Icon
                  className="h-[18px] w-[18px] shrink-0"
                  aria-hidden="true"
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/#collection-watch"
          className="mt-6 flex min-h-11 items-center justify-between gap-3 rounded-lg border border-[#24303b] px-3 text-sm text-slate-400 transition-colors hover:bg-[#111923] hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58e0ce]"
        >
          <span>Collection watch</span>
          <span className="text-[#58e0ce]" aria-hidden="true">
            ↗
          </span>
        </Link>
      </div>

      <div className="shrink-0 border-t border-[#24303b] p-4">
        <div className="rounded-lg border border-[#24303b] bg-[#111923] p-3">
          <p className="text-xs font-semibold text-slate-300">
            Read-only workspace
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Synthetic data in local SQLite
          </p>
        </div>
      </div>
    </aside>
  );
}
