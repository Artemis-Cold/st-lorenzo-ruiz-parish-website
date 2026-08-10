export type IntentionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "completed";

const styles: Record<IntentionStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
};

const labels: Record<IntentionStatus, string> = {
  pending: "Pending",
  approved: "Approved",
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
