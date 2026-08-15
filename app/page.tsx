import { Suspense } from "react";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DollarSign, Users, CreditCard } from "lucide-react";

// Revalidate data every 60 seconds (or 0 for dynamic)
export const revalidate = 0; 

async function getDashboardData() {
  // 1. Fetch all successful transactions
  const { data: transactions, error: txError } = await supabase
    .from("transactions")
    .select("amount, created_at")
    .eq("status", "Success");

  if (txError) throw txError;

  // 2. Fetch all users
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("created_at, status");

  if (usersError) throw usersError;

  // --- Logic for MoM Calculation ---
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Previous month calculation (handling year wrap)
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  let currentRevenue = 0;
  let prevRevenue = 0;
  
  let currentTxCount = 0;
  let prevTxCount = 0;

  // Revenue chart data grouped by MM/YYYY
  const revenueByMonth: Record<string, number> = {};

  transactions?.forEach((tx) => {
    const date = new Date(tx.created_at);
    const m = date.getMonth();
    const y = date.getFullYear();
    const amount = Number(tx.amount);

    // Group for chart (last 6 months ideally, but we group all and slice later)
    const label = `${String(m + 1).padStart(2, "0")}/${y.toString().slice(-2)}`;
    revenueByMonth[label] = (revenueByMonth[label] || 0) + amount;

    // MoM comparison
    if (m === currentMonth && y === currentYear) {
      currentRevenue += amount;
      currentTxCount++;
    } else if (m === prevMonth && y === prevMonthYear) {
      prevRevenue += amount;
      prevTxCount++;
    }
  });

  // Calculate Users
  let currentUsers = 0;
  let prevUsers = 0;
  
  users?.forEach((user) => {
    const date = new Date(user.created_at);
    const m = date.getMonth();
    const y = date.getFullYear();
    
    // We count total users acquired up to that month, but for a simple KPI, 
    // let's do new users acquired this month vs last month.
    if (m === currentMonth && y === currentYear) {
      currentUsers++;
    } else if (m === prevMonth && y === prevMonthYear) {
      prevUsers++;
    }
  });

  // Calculate percentages
  const calculateGrowth = (current: number, prev: number) => {
    if (prev === 0) return current > 0 ? 100 : 0;
    return ((current - prev) / prev) * 100;
  };

  const revenueGrowth = calculateGrowth(currentRevenue, prevRevenue);
  const userGrowth = calculateGrowth(currentUsers, prevUsers);
  const txGrowth = calculateGrowth(currentTxCount, prevTxCount);

  // Format Chart Data
  // Sort chronologically
  const sortedLabels = Object.keys(revenueByMonth).sort((a, b) => {
    const [m1, y1] = a.split("/");
    const [m2, y2] = b.split("/");
    return new Date(2000 + Number(y1), Number(m1) - 1).getTime() - new Date(2000 + Number(y2), Number(m2) - 1).getTime();
  });

  // Get last 6-12 months for chart
  const chartData = sortedLabels.slice(-8).map((label) => ({
    date: label,
    revenue: revenueByMonth[label],
  }));

  // Total active users right now
  const totalActiveUsers = users?.filter(u => u.status === 'Active').length || 0;

  return {
    kpis: {
      revenue: {
        value: `$${currentRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        growth: revenueGrowth,
      },
      users: {
        value: totalActiveUsers.toString(),
        growth: userGrowth, // Growth based on new acquisitions
      },
      transactions: {
        value: currentTxCount.toString(),
        growth: txGrowth,
      }
    },
    chartData,
  };
}

export default async function DashboardPage() {
  const { kpis, chartData } = await getDashboardData();

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8">
      {/* Header */}
      <div>
        <h1 className="font-space-grotesk text-3xl font-bold tracking-tight text-white uppercase">
          Overview
        </h1>
        <p className="text-zinc-400 mt-1">
          High-level metrics and financial performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="MRR (Current Month)"
          value={kpis.revenue.value}
          growth={kpis.revenue.growth}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KpiCard
          title="Active Users"
          value={kpis.users.value}
          growth={kpis.users.growth}
          icon={<Users className="h-5 w-5" />}
        />
        <KpiCard
          title="Successful Transactions"
          value={kpis.transactions.value}
          growth={kpis.transactions.growth}
          icon={<CreditCard className="h-5 w-5" />}
        />
      </div>

      {/* Revenue Chart */}
      <div className="mt-4">
        <RevenueChart data={chartData} />
      </div>
    </div>
  );
}
