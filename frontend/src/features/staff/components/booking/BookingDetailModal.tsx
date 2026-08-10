import { X, CircleDollarSign, CheckCircle2, Ban } from "lucide-react";

import BookingStatusBadge from "../booking/BookingStatusBadge";
import type { Booking, BookingStatus } from "../../types/booking";

interface Props {
  booking: Booking | null;
  onClose: () => void;
  onUpdateStatus: (id: number, status: BookingStatus) => void;
}

export default function BookingDetailModal({
  booking,
  onClose,
  onUpdateStatus,
}: Props) {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-lg">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Booking #{String(booking.id).padStart(2, "0")}
            </p>
            <h2 className="mt-1 font-serif text-xl font-bold text-[#292524]">
              {booking.names}
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
            <BookingStatusBadge status={booking.status} />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Service</span>
            <span className="font-medium text-[#292524]">{booking.type}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Date</span>
            <span className="font-medium tabular-nums text-[#292524]">
              {booking.date}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Contact No.</span>
            <span className="font-medium tabular-nums text-[#292524]">
              {booking.contactNumber}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Amount</span>
            <span className="font-semibold text-[#B22222]">
              ₱{booking.amount.toLocaleString()}.00
            </span>
          </div>
        </div>

        {(booking.status === "pending" || booking.status === "paid") && (
          <div className="mt-6 space-y-2.5">
            {booking.status === "pending" && (
              <button
                onClick={() => onUpdateStatus(booking.id, "paid")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B22222] py-3 font-semibold text-white transition hover:bg-[#8B1C1C]"
              >
                <CircleDollarSign size={18} />
                Mark as Paid
              </button>
            )}

            {booking.status === "paid" && (
              <button
                onClick={() => onUpdateStatus(booking.id, "completed")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <CheckCircle2 size={18} />
                Mark as Completed
              </button>
            )}

            <button
              onClick={() => onUpdateStatus(booking.id, "cancelled")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Ban size={18} />
              Cancel Booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
}