import { X, Loader2, PackageCheck, CheckCircle2, XCircle } from "lucide-react";

import RequestStatusBadge from "../requests/RequestStatusBadge";
import type { ServiceRequest, RequestStatus } from "../../types/request";

interface Props {
  request: ServiceRequest | null;
  onClose: () => void;
  onUpdateStatus: (id: number, status: RequestStatus) => void;
}

export default function RequestDetailModal({
  request,
  onClose,
  onUpdateStatus,
}: Props) {
  if (!request) return null;

  const isActionable =
    request.status === "pending" ||
    request.status === "processing" ||
    request.status === "ready";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-lg">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Request #{String(request.id).padStart(2, "0")}
            </p>
            <h2 className="mt-1 font-serif text-xl font-bold text-[#292524]">
              {request.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 rounded-2xl border border-[#E7E2DA] p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <RequestStatusBadge status={request.status} />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Category</span>
            <span className="font-medium text-[#292524]">
              {request.category}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Requested</span>
            <span className="font-medium text-[#292524]">
              {request.subtype}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Date</span>
            <span className="font-medium tabular-nums text-[#292524]">
              {request.date}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Contact No.</span>
            <span className="font-medium tabular-nums text-[#292524]">
              {request.contactNumber}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Amount</span>
            <span className="font-semibold text-[#B22222]">
              ₱{request.amount.toLocaleString()}.00
            </span>
          </div>
        </div>

        {isActionable && (
          <div className="mt-6 space-y-2.5">
            {request.status === "pending" && (
              <button
                onClick={() => onUpdateStatus(request.id, "processing")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B22222] py-3 font-semibold text-white transition hover:bg-[#8B1C1C]"
              >
                <Loader2 size={18} />
                Start Processing
              </button>
            )}

            {request.status === "processing" && (
              <button
                onClick={() => onUpdateStatus(request.id, "ready")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 font-semibold text-white transition hover:bg-purple-700"
              >
                <PackageCheck size={18} />
                Mark Ready for Pickup
              </button>
            )}

            {request.status === "ready" && (
              <button
                onClick={() => onUpdateStatus(request.id, "completed")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                <CheckCircle2 size={18} />
                Mark Completed
              </button>
            )}

            <button
              onClick={() => onUpdateStatus(request.id, "rejected")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 font-semibold text-red-600 transition hover:bg-red-50"
            >
              <XCircle size={18} />
              Reject Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}