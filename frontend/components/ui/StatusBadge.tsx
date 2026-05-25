import clsx from "clsx";
import type { RequestStatus } from "@/types";

const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  draft:            { label: "Draft",            className: "bg-slate-100 text-slate-600 border-slate-200" },
  ready_to_submit:  { label: "Ready to Submit",  className: "bg-blue-50 text-blue-700 border-blue-200" },
  submitted:        { label: "Submitted",         className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  records_received: { label: "Records Received", className: "bg-green-50 text-green-700 border-green-200" },
  closed:           { label: "Closed",            className: "bg-gray-100 text-gray-500 border-gray-200" },
};

// Overdue is a calculated badge, not a status
const OVERDUE_CONFIG = {
  label: "Overdue",
  className: "bg-red-50 text-red-700 border-red-200",
};

interface Props {
  status: RequestStatus;
  isOverdue?: boolean;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, isOverdue, size = "md" }: Props) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={clsx(
          "inline-flex items-center border rounded-full font-medium",
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
          config.className
        )}
      >
        {config.label}
      </span>
      {isOverdue && (
        <span
          className={clsx(
            "inline-flex items-center border rounded-full font-medium",
            size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
            OVERDUE_CONFIG.className
          )}
        >
          {OVERDUE_CONFIG.label}
        </span>
      )}
    </span>
  );
}
