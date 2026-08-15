"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col glass-panel border-r border-white/10 bg-[#0A0E17]/80">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="font-space-grotesk text-2xl font-bold tracking-tight text-white uppercase">
          Nattitor
        </h1>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all active:scale-95",
                  isActive
                    ? "bg-white/5 text-[#00E5FF]"
                    : "text-zinc-400 md:hover:bg-white/5 md:hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-[#00E5FF]" : "text-zinc-500 group-hover:text-white"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
