type BrandProps = {
  compact?: boolean;
  className?: string;
};

export function Brand({ compact = false, className = "" }: BrandProps) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`.trim()}>
      <svg
        className="h-10 w-10 shrink-0"
        viewBox="0 0 40 40"
        fill="none"
        role="img"
        aria-label="Nattitor mark"
      >
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="10"
          fill="#111923"
          stroke="#24303b"
        />
        <path
          d="M11 29V11L29 29V11"
          stroke="#58e0ce"
          strokeWidth="3.2"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <path
          d="M11 23.5L20.2 14.3"
          stroke="#58e0ce"
          strokeWidth="1.5"
          strokeLinecap="square"
          opacity=".72"
        />
      </svg>
      {!compact && (
        <span className="flex min-w-0 flex-col leading-none">
          <span className="truncate text-[15px] font-semibold tracking-[0.17em] text-slate-100">
            NATTITOR
          </span>
          <span className="mt-1.5 text-[9px] font-medium tracking-[0.24em] text-slate-400">
            OPERATIONS
          </span>
        </span>
      )}
    </div>
  );
}
