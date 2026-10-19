import { useState } from "react";
import { Bell, X } from "lucide-react";
import { Link } from "react-router-dom";

import type { ProfileBooking } from "@/api/auth";

const statusLabels: Record<ProfileBooking["status"], string> = {
  pending: "Awaiting parish review",
  approved: "Approved",
  paid: "Payment received",
  ready_for_pickup: "Ready for pickup",
  rejected: "Not approved — view booking details",
  cancelled: "Cancelled",
  completed: "Completed",
};

const updateKey = (booking: ProfileBooking) =>
  `${booking.status}:${booking.schedule_review?.status ?? ""}:${booking.schedule_review?.reviewedAt ?? ""}:${booking.schedule_review?.requestedAt ?? ""}`;

export default function BookingUpdatesNotification({
  bookings,
  userId,
}: {
  bookings: ProfileBooking[];
  userId: number;
}) {
  const storageKey = `booking-updates:${userId}`;
  const [updates] = useState(() => {
    let seen: Record<string, string> = {};
    try {
      seen = JSON.parse(sessionStorage.getItem(storageKey) ?? "{}") ?? {};
    } catch {
      // Notifications still work when browser storage is unavailable.
    }
    return bookings.filter(
      (booking) => seen[booking.id] !== updateKey(booking),
    );
  });
  const [dismissed, setDismissed] = useState(false);

  function dismiss() {
    try {
      const seen = JSON.parse(sessionStorage.getItem(storageKey) ?? "{}") ?? {};
      for (const booking of updates) seen[booking.id] = updateKey(booking);
      sessionStorage.setItem(storageKey, JSON.stringify(seen));
    } catch {
      // Dismiss locally even if browser storage is unavailable.
    }
    setDismissed(true);
  }

  if (dismissed || updates.length === 0) return null;

  return (
    <aside
      aria-label="Booking updates notification"
      className="fixed bottom-4 right-4 z-40 w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-[#B22222]/15 bg-white p-5 shadow-2xl sm:bottom-6 sm:right-6"
    >
      <div className="flex items-center gap-2">
        <Bell size={19} className="text-[#B22222]" aria-hidden="true" />
        <h2 className="font-serif text-lg font-bold">Booking Updates</h2>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss booking updates"
          className="ml-auto rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-[#B22222]"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <p role="status" className="mt-1 text-sm text-gray-500">
        {updates.length} booking {updates.length === 1 ? "update" : "updates"}
      </p>
      <ul className="mt-3 max-h-[40dvh] space-y-3 overflow-y-auto">
        {updates.map((booking) => (
          <li key={booking.id} className="rounded-xl bg-stone-50 p-3 text-sm">
            <p className="font-semibold text-gray-900">{booking.service}</p>
            <p className="text-xs text-gray-500">{booking.booking_reference}</p>
            <p className="mt-1 text-[#B22222]">
              {booking.schedule_review &&
              ["pending", "paid"].includes(booking.status)
                ? booking.schedule_review.status === "awaiting_review"
                  ? "Awaiting schedule confirmation"
                  : booking.schedule_review.status === "rejected"
                    ? "Schedule rejected — view the reason in My Profile"
                    : !booking.schedule_review.detailsSubmitted
                      ? "Schedule confirmed — submit your requirements"
                      : statusLabels[booking.status]
                : statusLabels[booking.status]}
            </p>
          </li>
        ))}
      </ul>
      <Link
        to="/profile"
        onClick={dismiss}
        className="mt-4 inline-block text-sm font-semibold text-[#B22222] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-[#B22222]"
      >
        View My Bookings →
      </Link>
    </aside>
  );
}
