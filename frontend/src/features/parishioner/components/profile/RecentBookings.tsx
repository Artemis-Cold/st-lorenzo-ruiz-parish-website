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
    <BookingCard
      title="Recent Bookings"
      className="flex h-[34rem] flex-col lg:h-[clamp(32rem,62vh,44rem)]"
      contentClassName="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth p-4 pr-3 sm:p-6 sm:pr-4 [scrollbar-color:#D6CEC4_transparent] [scrollbar-width:thin]"
    >
      <div className="h-full space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="cursor-pointer rounded-xl border border-gray-200 p-4 transition hover:border-[#B22222] hover:shadow-sm"
            onClick={() => onView(booking.id)}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center self-start rounded-xl bg-red-50">
                  {booking.service === "Document Request" ? (
                    <FileText size={22} className="text-[#B22222]" />
                  ) : (
                    <Church size={22} className="text-[#B22222]" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="break-words font-semibold">{booking.service}</h3>
                  <p className="break-all text-sm text-gray-500">
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
          <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center text-gray-500">
            No completed, cancelled, or rejected bookings found.
          </div>
        )}
      </div>
    </BookingCard>
  );
}
