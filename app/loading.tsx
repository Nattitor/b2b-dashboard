export default function Loading() {
  return (
    <div
      className="page-container"
      role="status"
      aria-label="Loading dashboard"
    >
      <span className="sr-only">Loading dashboard…</span>
      <div aria-hidden="true">
        <div className="skeleton-block mb-3 h-8 w-3/4 max-w-96" />
        <div className="skeleton-block mb-9 h-4 w-full max-w-80" />
        <div className="kpi-grid">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="glass-panel p-5">
              <div className="skeleton-block h-4 w-2/3" />
              <div className="skeleton-block my-5 h-8 w-3/4" />
              <div className="skeleton-block h-3 w-full" />
            </div>
          ))}
        </div>
        <div className="overview-grid">
          <div className="glass-panel p-6">
            <div className="skeleton-block h-80 w-full" />
          </div>
          <div className="glass-panel p-6">
            <div className="skeleton-block h-80 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
