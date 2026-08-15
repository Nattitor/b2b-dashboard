import { Suspense } from "react";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { DataTable } from "@/components/dashboard/DataTable";

export const revalidate = 0; // Dynamic rendering for search/sort

interface TransactionsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const resolvedParams = await searchParams;
  
  const page = Number(resolvedParams.page) || 1;
  const pageSize = 10;
  const sortBy = (resolvedParams.sortBy as string) || "created_at";
  const order = (resolvedParams.order as string) || "desc";
  const query = (resolvedParams.q as string) || "";

  // Pagination bounds
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Build Supabase Query
  let dbQuery = supabase
    .from("transactions")
    .select(`
      id,
      amount,
      status,
      created_at,
      users!inner (
        name,
        email
      )
    `, { count: "exact" });

  // Apply Search Filter (transactions ID or user name)
  if (query) {
    // Note: To search across tables in Supabase with foreign keys, 
    // it requires embedding the filter inside the inner join.
    // For simplicity, we search by user name here. 
    // If querying UUID requires valid format, we avoid crashing by only searching name.
    dbQuery = dbQuery.ilike("users.name", `%${query}%`);
  }

  // Apply Sorting
  // For sorting by nested user fields, we'd need RPC, but for native fields:
  dbQuery = dbQuery.order(sortBy, { ascending: order === "asc" });

  // Apply Pagination
  dbQuery = dbQuery.range(from, to);

  const { data, count, error } = await dbQuery;

  if (error) {
    console.error("Error fetching transactions:", error);
    // You could return a custom error UI here
  }

  // Cast the data, Supabase types might complain about the inner join array if not generated
  const formattedData = (data || []).map(tx => ({
    ...tx,
    users: Array.isArray(tx.users) ? tx.users[0] : tx.users
  })) as any[];

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8">
      {/* Header */}
      <div>
        <h1 className="font-space-grotesk text-3xl font-bold tracking-tight text-white uppercase">
          Ledger
        </h1>
        <p className="text-zinc-400 mt-1">
          Complete history of all platform transactions.
        </p>
      </div>

      <Suspense fallback={<div className="h-96 flex items-center justify-center text-white">Loading table...</div>}>
        <DataTable 
          data={formattedData} 
          totalCount={count || 0} 
          pageSize={pageSize} 
        />
      </Suspense>
    </div>
  );
}
