"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueDataPoint {
  date: string; // MM/DD format
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

// Custom Brutalist Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 border border-white/20 bg-[#0A0E17]/95 shadow-2xl backdrop-blur-md">
        <p className="text-xs text-zinc-400 mb-1">{label}</p>
        <p className="font-jetbrains-mono text-lg font-bold text-[#00E5FF]">
          ${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="glass-panel p-6 flex flex-col gap-y-6 w-full h-[400px]">
      <div>
        <h3 className="font-space-grotesk text-xl font-bold tracking-tight text-white uppercase">
          Revenue Trend
        </h3>
        <p className="text-sm text-zinc-400">Monthly recurring revenue over time</p>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="rgba(255,255,255,0.05)" 
            />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#71717A", fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#71717A", fontSize: 12, fontFamily: "monospace" }} 
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#00E5FF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
