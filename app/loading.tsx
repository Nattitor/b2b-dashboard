export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-8 w-48 animate-pulse bg-white/5 border border-white/10 rounded-md" />
        <div className="h-4 w-64 animate-pulse bg-white/5 border border-white/10 rounded-md" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-panel p-6 flex flex-col gap-y-4 h-[120px]">
            <div className="h-4 w-24 animate-pulse bg-white/5 border border-white/10 rounded-md" />
            <div className="h-8 w-32 animate-pulse bg-white/5 border border-white/10 rounded-md mt-auto" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="glass-panel w-full h-[400px] flex flex-col p-6 gap-y-6">
        <div className="flex flex-col gap-2">
          <div className="h-6 w-32 animate-pulse bg-white/5 border border-white/10 rounded-md" />
          <div className="h-4 w-48 animate-pulse bg-white/5 border border-white/10 rounded-md" />
        </div>
        <div className="flex-1 w-full animate-pulse bg-white/5 border border-white/10 rounded-md" />
      </div>
    </div>
  );
}
