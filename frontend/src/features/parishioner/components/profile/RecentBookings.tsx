import { CalendarDays, Church, FileText } from "lucide-react";

import type { ProfileBooking } from "@/api/auth";
import { BookingCard } from "../booking";

const statusStyle: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  rejected: "bg-gray-200 text-gray-700",
};

const formatDate = (date: string | null) =>
  date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "No scheduled date";

const formatStatus = (status: string) =>
  status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function RecentBookings({
  bookings,
  onView,
}: {
  bookings: ProfileBooking[];
  onView: (id: number) => void;
}) {
  return (
    <BookingCard title="Recent Bookings">
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="rounded-xl border border-gray-200 p-4 transition hover:border-[#B22222]"
            onClick={() => onView(booking.id)}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="rounded-xl bg-red-50 p-3">
                  {booking.service === "Document Request" ? (
                    <FileText size={22} className="text-[#B22222]" />
                  ) : (
                    <Church size={22} className="text-[#B22222]" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{booking.service}</h3>
                  <p className="text-sm text-gray-500">
                    {booking.booking_reference}
                  </p>
                  {booking.package && (
                    <p className="mt-1 text-sm">{booking.package}</p>
                  )}
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  statusStyle[booking.status] ?? "bg-gray-100 text-gray-700"
                }`}
              >
                {formatStatus(booking.status)}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t pt-4 text-sm text-gray-600">
              <CalendarDays size={16} />
              {formatDate(booking.booking_date)}
              {booking.start_time && ` • ${booking.start_time}`}
            </div>
            <p className="mt-3 text-right text-xs font-semibold text-[#B22222]">View booking information</p>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="rounded-xl border border-dashed py-12 text-center text-gray-500">
            No completed, cancelled, or rejected bookings found.
          </div>
        )}
      </div>
    </BookingCard>
  );
}
