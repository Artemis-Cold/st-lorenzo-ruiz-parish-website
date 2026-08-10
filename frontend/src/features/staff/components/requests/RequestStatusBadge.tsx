import type { RequestStatus } from "../../types/request";

const styles: Record<RequestStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const labels: Record<RequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export default function RequestStatusBadge({
  status,
}: {
  status: RequestStatus;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
