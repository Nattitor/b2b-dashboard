"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/brand/Brand";

const navItems = [
  { name: "Overview", href: "/" },
  { name: "Transactions", href: "/transactions" },
];

export function Topbar() {
  const pathname = usePathname();
  const pageTitle = pathname === "/transactions" ? "Transactions" : "Overview";

  return (
    <header className="sticky top-0 z-40 flex min-h-28 shrink-0 flex-col md:h-20 md:min-h-20 border-b border-[#24303b] bg-[#0b1017] px-4 sm:px-6 lg:px-8">
      <div className="flex min-h-16 flex-1 items-center gap-4">
        <Link
          href="/"
          aria-label="Nattitor overview"
          className="shrink-0 md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#58e0ce]"
        >
          <Brand compact />
        </Link>

        <nav
          aria-label="Breadcrumb"
          className="hidden min-w-0 flex-1 items-center gap-2 text-sm md:flex"
        >
          <Link
            href="/"
            className="text-slate-400 transition-colors hover:text-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#58e0ce]"
          >
            Workspace
          </Link>
          <span className="text-slate-600" aria-hidden="true">
            /
          </span>
          <span
            className="truncate font-medium text-slate-200"
            aria-current="page"
          >
            {pageTitle}
          </span>
        </nav>

        <form
          className="relative ml-auto flex w-full min-w-0 max-w-[34rem] flex-1 md:ml-0"
          action="/transactions"
          method="GET"
          role="search"
        >
          <label htmlFor="global-search" className="sr-only">
            Search transactions
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="global-search"
            className="h-11 w-full min-w-0 rounded-lg border border-[#24303b] bg-[#111923] pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-[#58e0ce]/60 focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-[#58e0ce]"
            placeholder="Search transactions"
            type="search"
            name="q"
            maxLength={100}
          />
        </form>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="grid grid-cols-2 gap-2 pb-2 md:hidden"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-11 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58e0ce] ${
                isActive
                  ? "border-[#58e0ce]/25 bg-[#58e0ce]/10 text-[#58e0ce]"
                  : "border-transparent text-slate-400 hover:bg-[#111923] hover:text-slate-100"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
