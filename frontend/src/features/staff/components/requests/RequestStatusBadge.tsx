import type { RequestStatus } from "../../types/request";
import { requestStatusLabel } from "../../utils/requestStatus";

const styles: Record<RequestStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-sky-50 text-sky-700 border-sky-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  ready_for_pickup: "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
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
      {requestStatusLabel(status)}
    </span>
  );
}
