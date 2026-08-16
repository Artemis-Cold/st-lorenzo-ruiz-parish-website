import { X } from "lucide-react";

import StatusBadge from "../StatusBadge";
import type { MassIntention } from "../../types/massIntention";

interface Props {
  intention: MassIntention | null;
  onClose: () => void;
}

export default function MassIntentionDetailModal({
  intention,
  onClose,
}: Props) {
  if (!intention) return null;

  return (
    <div data-app-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div data-modal-scroll="true" className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-7 shadow-lg">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Intention #{String(intention.id).padStart(2, "0")}
            </p>
            <h2 className="mt-1 font-serif text-xl font-bold text-[#292524]">
              {intention.names}
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
            <StatusBadge status={intention.status} />
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-gray-500">Booking Reference</span>
            <span className="text-right font-medium text-[#292524]">
              {intention.reference}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-gray-500">Payment Reference</span>
            <span className="text-right font-medium text-[#292524]">
              {intention.paymentReference}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-gray-500">Submitted Receipt</span>
            {intention.receipt ? (
              <a
                href={intention.receipt.url}
                target="_blank"
                rel="noreferrer"
                className="text-right font-medium text-[#B22222] hover:underline"
              >
                {intention.receipt.fileName}
              </a>
            ) : (
              <span className="text-gray-400">None</span>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Type</span>
            <span className="font-medium text-[#292524]">{intention.type}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Date</span>
            <span className="font-medium tabular-nums text-[#292524]">
              {intention.date}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Contact No.</span>
            <span className="font-medium tabular-nums text-[#292524]">
              {intention.contactNumber}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Amount</span>
            <span className="font-semibold text-[#B22222]">
              ₱{intention.amount.toLocaleString()}.00
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
