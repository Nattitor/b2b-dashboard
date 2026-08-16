"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";

interface Transaction {
  id: string;
  amount: number;
  status: "Success" | "Pending" | "Failed";
  created_at: string;
  users: {
    name: string;
    email: string;
  } | null;
}

interface DataTableProps {
  data: Transaction[];
  totalCount: number;
  pageSize: number;
}

const spring = { type: "spring" as const, stiffness: 350, damping: 25, mass: 0.5 };

export function DataTable({ data, totalCount, pageSize }: DataTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state sync
  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSortBy = searchParams.get("sortBy") || "created_at";
  const currentOrder = searchParams.get("order") || "desc";
  const currentQuery = searchParams.get("q") || "";

  const totalPages = Math.ceil(totalCount / pageSize);

  // Local state for immediate input feedback before debounce
  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const debouncedQuery = useDebounce(searchQuery, 400);

  // Update URL function
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      
      // Reset page when search query or sort changes (unless we are explicitly changing page)
      if (name !== "page") {
        params.set("page", "1");
      }
      return params.toString();
    },
    [searchParams]
  );

  // Trigger routing when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== currentQuery) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedQuery) {
        params.set("q", debouncedQuery);
      } else {
        params.delete("q");
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedQuery, pathname, router, searchParams, currentQuery]);

  const handleSort = (column: string) => {
    const isAsc = currentSortBy === column && currentOrder === "asc";
    const nextOrder = isAsc ? "desc" : "asc";
    const queryString = new URLSearchParams(searchParams.toString());
    queryString.set("sortBy", column);
    queryString.set("order", nextOrder);
    queryString.set("page", "1");
    router.push(`${pathname}?${queryString.toString()}`);
  };

  return (
    <div className="glass-panel flex flex-col w-full overflow-hidden">
      {/* Table Header / Actions */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by ID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0E17]/50 border border-white/10 rounded-md py-2 pl-9 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/50 transition-all font-sans"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-400 min-w-[800px]">
          <thead className="text-xs uppercase bg-white/[0.02] border-b border-white/10">
            <tr>
              <th className="px-3 md:px-6 py-4 font-medium text-white">Transaction ID</th>
              <th className="px-3 md:px-6 py-4 font-medium text-white">User</th>
              <th className="px-3 md:px-6 py-0 font-medium text-white select-none">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  transition={spring}
                  className="flex items-center gap-1 py-4 outline-none group"
                  onClick={() => handleSort("amount")}
                >
                  <span className="md:group-hover:text-[#00E5FF] transition-colors">Amount</span>
                  <ArrowUpDown className="h-3 w-3 text-zinc-500 md:group-hover:text-[#00E5FF] transition-colors" />
                </motion.button>
              </th>
              <th className="px-3 md:px-6 py-4 font-medium text-white">Status</th>
              <th className="px-3 md:px-6 py-0 font-medium text-white select-none">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  transition={spring}
                  className="flex items-center gap-1 py-4 outline-none group"
                  onClick={() => handleSort("created_at")}
                >
                  <span className="md:group-hover:text-[#00E5FF] transition-colors">Date</span>
                  <ArrowUpDown className="h-3 w-3 text-zinc-500 md:group-hover:text-[#00E5FF] transition-colors" />
                </motion.button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 relative">
            <AnimatePresence mode="popLayout">
              {data.length === 0 ? (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan={5} className="px-3 md:px-6 py-8 text-center text-zinc-500">
                    No transactions found.
                  </td>
                </motion.tr>
              ) : (
                data.map((tx) => (
                  <motion.tr 
                    key={tx.id} 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={spring}
                    className="md:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-3 md:px-6 py-4 font-jetbrains-mono text-xs tracking-tight text-zinc-300">
                      {tx.id.split("-")[0]}...
                    </td>
                    <td className="px-3 md:px-6 py-4">
                      <div className="font-medium text-white">{tx.users?.name || "Unknown"}</div>
                      <div className="text-xs text-zinc-500">{tx.users?.email}</div>
                    </td>
                    <td className="px-3 md:px-6 py-4 font-jetbrains-mono font-bold text-white">
                      ${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 md:px-6 py-4">
                      <span 
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium font-jetbrains-mono border",
                          tx.status === "Success" && "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20",
                          tx.status === "Pending" && "text-amber-400 bg-amber-400/10 border-amber-400/20",
                          tx.status === "Failed" && "text-red-400 bg-red-400/10 border-red-400/20"
                        )}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-4 font-jetbrains-mono text-xs text-zinc-400">
                      {new Date(tx.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between p-4 border-t border-white/10 bg-white/[0.02]">
        <div className="text-sm text-zinc-500 font-jetbrains-mono text-center sm:text-left">
          Showing <span className="text-white">{data.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{" "}
          <span className="text-white">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
          <span className="text-white">{totalCount}</span> results
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={currentPage <= 1 ? {} : { scale: 0.95 }}
            transition={spring}
            onClick={() => router.push(`${pathname}?${createQueryString("page", String(currentPage - 1))}`)}
            disabled={currentPage <= 1}
            className="p-2 rounded-md border border-white/10 text-white bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed md:hover:bg-white/10 transition-colors outline-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          
          <div className="flex items-center justify-center min-w-[2rem] font-jetbrains-mono text-sm text-white">
            {currentPage} / {totalPages || 1}
          </div>

          <motion.button
            whileTap={currentPage >= totalPages ? {} : { scale: 0.95 }}
            transition={spring}
            onClick={() => router.push(`${pathname}?${createQueryString("page", String(currentPage + 1))}`)}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-md border border-white/10 text-white bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed md:hover:bg-white/10 transition-colors outline-none"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
