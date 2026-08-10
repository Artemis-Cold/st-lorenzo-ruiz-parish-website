import { CircleCheckBig, Clock3, Megaphone } from "lucide-react";

import type { ProfileBooking } from "@/api/auth";

export default function AnnouncementCard({ bookings }: { bookings: ProfileBooking[] }) {
  const pending = bookings.filter((booking) => booking.status === "pending").length;
  const approved = bookings.filter((booking) => booking.status === "approved").length;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg">
      <div className="mb-5 flex items-center gap-2">
        <Megaphone className="text-[#B22222]" />
        <h2 className="font-serif text-xl font-bold">Booking Updates</h2>
      </div>
      <div className="space-y-4">
        {pending > 0 && (
          <div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-amber-800">
            <Clock3 className="mt-0.5 shrink-0" size={19} />
            <p className="text-sm">
              {pending} {pending === 1 ? "booking is" : "bookings are"} awaiting parish review.
            </p>
          </div>
        )}
        {approved > 0 && (
          <div className="flex gap-3 rounded-xl bg-green-50 p-4 text-green-800">
            <CircleCheckBig className="mt-0.5 shrink-0" size={19} />
            <p className="text-sm">
              {approved} {approved === 1 ? "booking has" : "bookings have"} been approved.
            </p>
          </div>
        )}
        {bookings.length === 0 && (
          <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
            Your booking updates will appear here.
          </p>
        )}
      </div>
    </div>
  );
}
