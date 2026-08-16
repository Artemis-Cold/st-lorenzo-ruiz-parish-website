export type IntentionStatus =
  | "paid"
  | "rejected"
  | "cancelled"
  | "completed";

const styles: Record<IntentionStatus, string> = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
};

const labels: Record<IntentionStatus, string> = {
  paid: "Paid",
  rejected: "Rejected",
  cancelled: "Cancelled",
  completed: "Completed",
};

export default function StatusBadge({ status }: { status: IntentionStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
