export default function Loading() {
  return (
    <div
      className="page-container"
      role="status"
      aria-label="Loading transactions"
    >
      <span className="sr-only">Loading transactions…</span>
      <div aria-hidden="true">
        <div className="skeleton-block mb-4 h-8 w-3/4 max-w-96" />
        <div className="skeleton-block mb-9 h-4 w-full max-w-80" />
        <div className="glass-panel p-5">
          <div className="skeleton-block mb-7 h-11 w-full max-w-96" />
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="flex gap-4 border-t border-[#24303b] py-5"
            >
              <div className="skeleton-block h-8 w-1/2" />
              <div className="skeleton-block ml-auto h-8 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
