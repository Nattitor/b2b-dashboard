export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-8 w-48 animate-pulse bg-white/5 border border-white/10 rounded-md" />
        <div className="h-4 w-64 animate-pulse bg-white/5 border border-white/10 rounded-md" />
      </div>

      {/* Table Wrapper Skeleton */}
      <div className="glass-panel flex flex-col w-full h-[600px] overflow-hidden">
        {/* Search Bar Skeleton */}
        <div className="p-4 border-b border-white/10 bg-white/[0.02]">
          <div className="h-10 w-64 animate-pulse bg-white/5 border border-white/10 rounded-md" />
        </div>

        {/* Rows Skeleton */}
        <div className="flex flex-col divide-y divide-white/5">
          {/* Header Row */}
          <div className="flex h-12 items-center px-6 bg-white/[0.02]">
            <div className="h-4 w-full animate-pulse bg-white/5 rounded" />
          </div>
          
          {/* Data Rows */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex h-16 items-center px-6">
              <div className="flex w-full gap-4">
                <div className="h-4 w-1/5 animate-pulse bg-white/5 rounded" />
                <div className="h-4 w-1/4 animate-pulse bg-white/5 rounded" />
                <div className="h-4 w-1/6 animate-pulse bg-white/5 rounded" />
                <div className="h-6 w-16 animate-pulse bg-white/5 rounded-full" />
                <div className="h-4 w-1/6 animate-pulse bg-white/5 rounded ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
