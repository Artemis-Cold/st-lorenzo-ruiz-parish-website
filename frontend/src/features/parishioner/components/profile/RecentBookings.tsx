import {
  CalendarDays,
  Church,
  CircleCheckBig,
  Clock3,
  FileText,
} from "lucide-react";

import { BookingCard } from "../booking";

interface Booking {
  id: number;
  service: string;
  schedule: string;
  status: "Completed" | "Cancelled" | "Rejected";
}

const recentBookings: Booking[] = [
  {
    id: 1,
    service: "Wedding",
    schedule: "March 22, 2026 • 5:00 PM",
    status: "Completed",
  },
  {
    id: 2,
    service: "Mass Intention",
    schedule: "March 18, 2026 • 7:00 AM",
    status: "Completed",
  },
  {
    id: 3,
    service: "Document Request",
    schedule: "March 10, 2026",
    status: "Cancelled",
  },
];

const statusStyle = {
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  Rejected: "bg-gray-200 text-gray-700",
};

export default function RecentBookings() {
  return (
    <BookingCard title="Recent Bookings">
      <div className="space-y-4">
        {recentBookings.map((booking) => (
          <div
            key={booking.id}
            className="rounded-xl border border-gray-200 p-4 transition hover:border-[#B22222]"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="rounded-xl bg-red-50 p-3">
                  {booking.service === "Document Request" ? (
                    <FileText
                      size={22}
                      className="text-[#B22222]"
                    />
                  ) : (
                    <Church
                      size={22}
                      className="text-[#B22222]"
                    />
                  )}
                </div>

                <div>
                  <h3 className="font-semibold">
                    {booking.service}
                  </h3>

                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <CalendarDays size={14} />

                    {booking.schedule}
                  </div>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  statusStyle[booking.status]
                }`}
              >
                {booking.status}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between border-t pt-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock3 size={15} />

                Booking #{booking.id}
              </div>

              <button className="flex items-center gap-2 rounded-lg border border-[#B22222] px-3 py-1.5 text-sm font-medium text-[#B22222] transition hover:bg-[#B22222] hover:text-white">
                <CircleCheckBig size={16} />

                View Details
              </button>
            </div>
          </div>
        ))}

        {recentBookings.length === 0 && (
          <div className="py-10 text-center text-gray-500">
            No recent bookings found.
          </div>
        )}
      </div>
    </BookingCard>
  );
}