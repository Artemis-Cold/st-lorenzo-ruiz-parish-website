import { CalendarDays, Church } from "lucide-react";

import { BookingCard } from "../booking";
import type { ProfileBooking } from "@/api/auth";

const statusStyles: Record<ProfileBooking["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  approved: "bg-green-100 text-green-700",
  ready_for_pickup: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  rejected: "bg-gray-200 text-gray-700",
};

const statusLabel = (status: ProfileBooking["status"]) =>
  status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function CurrentBookings({
  bookings,
  onView,
}: {
  bookings: ProfileBooking[];
  onView: (id: number) => void;
}) {
  return (
    <BookingCard
      title="Current Bookings"
      className="flex h-[34rem] flex-col lg:h-[clamp(32rem,62vh,44rem)]"
      contentClassName="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth p-4 pr-3 sm:p-6 sm:pr-4 [scrollbar-color:#D6CEC4_transparent] [scrollbar-width:thin]"
    >
      {bookings.length === 0 ? (
        <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center text-gray-500">
          <Church size={42} className="mx-auto mb-3 text-gray-300" />
          You have no active bookings.
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="cursor-pointer rounded-xl border border-gray-200 p-5 transition hover:border-[#B22222] hover:shadow-sm"
              onClick={() => onView(booking.id)}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{booking.service}</h3>
                  <p className="text-sm text-gray-500">
                    {booking.booking_reference}
                  </p>
                  {booking.package && (
                    <p className="mt-1 text-sm">{booking.package}</p>
                  )}
                </div>
                <span
                  className={
                    "rounded-full px-3 py-1 text-xs font-semibold " +
                    statusStyles[booking.status]
                  }
                >
                  {statusLabel(booking.status)}
                </span>
              </div>
              <p className="mt-3 text-right text-xs font-semibold text-[#B22222]">View booking information</p>

              <div className="mt-4 flex items-center gap-2 border-t pt-4 text-sm text-gray-600">
                <CalendarDays size={16} />
                {booking.booking_date
                  ? new Date(
                      booking.booking_date + "T00:00:00",
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "No scheduled date"}
                {booking.start_time && " • " + booking.start_time}
              </div>
            </div>
          ))}
        </div>
      )}
    </BookingCard>
  );
}
