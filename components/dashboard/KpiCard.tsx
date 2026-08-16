"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface KpiCardProps {
  title: string;
  value: string;
  growth: number; // Percentage
  icon?: ReactNode;
}

const spring = { type: "spring" as const, stiffness: 350, damping: 25, mass: 0.5 };

export function KpiCard({ title, value, growth, icon }: KpiCardProps) {
  const isPositive = growth >= 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={spring}
      className="glass-panel p-4 md:p-6 flex flex-col gap-y-4 relative overflow-hidden group"
    >
      {/* Subtle hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0E17]/50 to-white/[0.02] opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-center justify-between z-10">
        <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
        {icon && <div className="text-zinc-500">{icon}</div>}
      </div>
      
      <div className="flex items-baseline gap-x-3 z-10">
        <p className="font-jetbrains-mono text-3xl font-bold text-white tracking-tight">
          {value}
        </p>
        
        <div 
          className={cn(
            "flex items-center gap-x-1 text-sm font-medium font-jetbrains-mono px-2 py-0.5 rounded-full border",
            isPositive 
              ? "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20" 
              : "text-red-400 bg-red-400/10 border-red-400/20"
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>{Math.abs(growth).toFixed(1)}%</span>
        </div>
      </div>
    </motion.div>
  );
}
