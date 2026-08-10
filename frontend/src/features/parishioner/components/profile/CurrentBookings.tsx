import { CalendarDays, Church } from "lucide-react";

import { BookingCard } from "../booking";
import type { ProfileBooking } from "@/api/auth";

export default function CurrentBookings({
  bookings,
}: {
  bookings: ProfileBooking[];
}) {
  return (
    <BookingCard title="Current Bookings">
      {bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed py-12 text-center text-gray-500">
          <Church size={42} className="mx-auto mb-3 text-gray-300" />
          You have no pending or approved bookings.
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-xl border border-gray-200 p-5"
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
                    "rounded-full px-3 py-1 text-xs font-semibold uppercase " +
                    (booking.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700")
                  }
                >
                  {booking.status}
                </span>
              </div>

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
