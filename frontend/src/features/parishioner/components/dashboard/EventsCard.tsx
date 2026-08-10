import { CalendarDays, Clock, Church } from "lucide-react";

import type { ProfileBooking } from "@/api/auth";

export default function EventsCard({ bookings }: { bookings: ProfileBooking[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduled = bookings
    .filter(
      (booking) =>
        booking.booking_date &&
        new Date(`${booking.booking_date}T00:00:00`) >= today,
    )
    .sort((a, b) => (a.booking_date ?? "").localeCompare(b.booking_date ?? ""));

  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <CalendarDays className="text-[#B22222]" />
        <h2 className="font-serif text-2xl font-bold">My Upcoming Bookings</h2>
      </div>

      {scheduled.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-14 text-center text-gray-500">
          <Church className="mx-auto mb-3 text-gray-300" size={44} />
          You have no scheduled bookings yet.
        </div>
      ) : (
        <div className="space-y-5">
          {scheduled.map((booking) => {
            const date = new Date(`${booking.booking_date}T00:00:00`);
            return (
              <div
                key={booking.id}
                className="flex gap-4 rounded-2xl border border-gray-100 p-4 transition hover:shadow-md sm:gap-5 sm:p-5"
              >
                <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#B22222] text-white">
                  <span className="text-2xl font-bold">{date.getDate()}</span>
                  <span className="text-xs tracking-widest">
                    {date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">{booking.service}</h3>
                      <p className="text-sm text-gray-500">{booking.booking_reference}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      booking.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                    {booking.start_time && (
                      <span className="flex items-center gap-2">
                        <Clock size={16} /> {booking.start_time}
                      </span>
                    )}
                    {booking.package && <span>{booking.package}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
