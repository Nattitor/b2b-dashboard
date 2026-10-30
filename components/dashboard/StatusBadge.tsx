import { cn } from "@/lib/utils";
import type { TransactionStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span
      className={cn(
        "status-badge",
        status === "Success"
          ? "status-success"
          : status === "Pending"
            ? "status-pending"
            : "status-failed",
      )}
    >
      <span aria-hidden="true" />
      {status === "Success" ? "Paid" : status}
    </span>
  );
}
