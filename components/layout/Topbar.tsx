"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, User, LogOut, LayoutDashboard, ArrowRightLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, stiffness: 350, damping: 25, mass: 0.5 };

const navItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
];

export function Topbar() {
  const pathname = usePathname();
  const [showToast, setShowToast] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  
  const toastRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Click outside handlers
  useOnClickOutside(toastRef, () => setShowToast(false));
  useOnClickOutside(menuRef, () => setShowMenu(false));
  useOnClickOutside(mobileNavRef, () => setShowMobileNav(false));

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 glass-panel border-b border-white/10 bg-[#0A0E17]/80 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 relative">
      {/* Mobile Hamburger (visible only on small screens) */}
      <div ref={mobileNavRef} className="md:hidden">
        <button
          type="button"
          onClick={() => setShowMobileNav((prev) => !prev)}
          className="-m-2.5 p-2.5 text-zinc-400 transition-colors active:scale-95 outline-none"
        >
          <span className="sr-only">Open sidebar</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <AnimatePresence>
          {showMobileNav && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={spring}
              className="absolute left-0 top-full mt-0 w-full px-4 pb-4 pt-2 z-50 bg-[#0A0E17] border-b border-white/10 shadow-2xl"
            >
              <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setShowMobileNav(false)}
                      className={cn(
                        "flex items-center gap-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-all active:scale-95",
                        isActive
                          ? "bg-white/5 text-[#00E5FF]"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-colors",
                          isActive ? "text-[#00E5FF]" : "text-zinc-500"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-zinc-500"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-white placeholder:text-zinc-500 focus:ring-0 sm:text-sm"
            placeholder="Search transactions..."
            type="search"
            name="search"
            disabled
          />
        </form>
        
        <div className="flex items-center gap-x-4 lg:gap-x-6 relative">
          
          {/* Notifications */}
          <div className="relative" ref={toastRef}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              transition={spring}
              type="button"
              onClick={() => setShowToast((prev) => !prev)}
              className="-m-2.5 p-2.5 text-zinc-400 md:hover:text-white transition-colors outline-none"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" aria-hidden="true" />
            </motion.button>

            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={spring}
                  className="absolute right-0 top-full mt-2 w-48 rounded-md bg-[#0A0E17] border border-white/10 shadow-lg py-2 px-3 z-50 glass-panel"
                >
                  <p className="text-xs font-medium text-zinc-300 text-center font-jetbrains-mono">
                    No new notifications
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-white/10" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="relative" ref={menuRef}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              transition={spring}
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="-m-1.5 flex items-center p-1.5 outline-none group"
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 md:group-hover:border-[#00E5FF]/50 transition-colors">
                <User className="h-4 w-4 text-zinc-400 md:group-hover:text-white transition-colors" />
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-white" aria-hidden="true">
                  Admin
                </span>
              </span>
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={spring}
                  className="absolute right-0 top-full mt-2 w-48 rounded-md bg-[#0A0E17] border border-white/10 shadow-lg py-1 z-50 glass-panel overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      // In a real app: signOut()
                    }}
                    className="flex w-full items-center gap-x-2 px-4 py-2 text-sm text-zinc-300 md:hover:bg-white/5 md:hover:text-white transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4 text-zinc-500" />
                    Log out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
