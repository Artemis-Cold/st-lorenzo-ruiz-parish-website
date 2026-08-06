import { CalendarDays, CreditCard, Upload } from "lucide-react";

import { BookingCard } from "../booking";

export default function CurrentBookings() {
  return (
    <BookingCard title="Current Booking">
      <div className="space-y-6 text-center">
        {/* Service */}
        <div>
          <h2 className="text-3xl font-semibold tracking-widest">
            WEDDING
          </h2>

          <div className="mt-2 flex items-center justify-center gap-2 text-gray-700">
            <CalendarDays size={18} />

            <span className="text-xl">
              March 22, 2026 — 5:00 PM
            </span>

            <button className="text-xs italic text-[#B22222] hover:underline">
              Reschedule
            </button>
          </div>
        </div>

        {/* Booking Status */}
        <div>
          <h3 className="text-2xl font-semibold tracking-widest">
            BOOKING STATUS
          </h3>

          <p className="mt-1 text-xl font-medium text-amber-600">
            PENDING
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <button className="rounded-lg bg-[#B22222] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#991B1B]">
            <span className="flex items-center gap-2">
              <Upload size={16} />
              Upload Document
            </span>
          </button>

          <button className="rounded-lg border border-[#B22222] px-5 py-2 text-sm font-medium text-[#B22222] transition hover:bg-red-50">
            Cancel Booking
          </button>
        </div>

        <div className="space-y-4 rounded-xl border bg-gray-50 p-5">
          <div>
            <h3 className="flex items-center justify-center gap-2 text-2xl font-semibold tracking-widest">
              <CreditCard size={22} />
              REQUEST STATUS
            </h3>

            <p className="mt-2 text-lg font-medium text-red-600">
              UNPAID
            </p>
          </div>

          <div className="mx-auto max-w-sm space-y-2 text-left">
            <div className="flex justify-between">
              <span>Certificate / Booking Fees</span>

              <span>₱1000</span>
            </div>

            <div className="border-t pt-2 text-lg font-semibold">
              <div className="flex justify-between">
                <span>Total</span>

                <span className="text-[#B22222]">
                  ₱1000
                </span>
              </div>
            </div>
          </div>

          <button className="rounded-lg bg-[#B22222] px-8 py-2 text-white transition hover:bg-[#991B1B]">
            Pay Now
          </button>
        </div>
      </div>
    </BookingCard>
  );
}