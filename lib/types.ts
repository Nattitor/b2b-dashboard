export const transactionStatuses = ["Success", "Pending", "Failed"] as const;
export type TransactionStatus = (typeof transactionStatuses)[number];

export interface Customer {
  id: string;
  name: string;
  email: string;
  created_at: string;
  status: "Active" | "Inactive";
}

export interface Plan {
  id: string;
  plan_name: string;
  monthly_price: number;
}

export interface Transaction {
  id: string;
  amount: number;
  status: TransactionStatus;
  created_at: string;
  customer: Pick<Customer, "name" | "email">;
  plan: string;
}

export interface Dataset {
  customers: Customer[];
  transactions: Transaction[];
}

export interface ChartPoint {
  date: string;
  revenue: number;
}

export interface DashboardSnapshot {
  asOf: string;
  revenue: number;
  revenueGrowth: number | null;
  successfulPayments: number;
  paymentGrowth: number | null;
  activeCustomers: number;
  newCustomers: number;
  successRate: number;
  rateChange: number;
  pendingAmount: number;
  pendingCount: number;
  failedAmount: number;
  failedCount: number;
  chart: ChartPoint[];
  plans: { name: string; revenue: number; transactions: number }[];
  recentTransactions: Transaction[];
}

export interface LedgerFilters {
  page: number;
  pageSize: number;
  sortBy: "created_at" | "amount";
  order: "asc" | "desc";
  query: string;
  status: TransactionStatus | "All";
}

export interface LedgerResult {
  data: Transaction[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export type SearchParams = Record<string, string | string[] | undefined>;
