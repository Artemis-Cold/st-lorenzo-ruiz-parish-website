import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { ProfileBooking } from "@/api/auth";
import { getPublicEvents, type ParishEvent } from "@/services/eventService";
import { eventsByDate } from "@/utils/eventCalendar";
import CalendarEventTooltip from "@/components/events/CalendarEventTooltip";

export default function CalendarCard({ bookings }: { bookings: ProfileBooking[] }) {
  const [displayedMonth, setDisplayedMonth] = useState(() => new Date());
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const [eventResult, setEventResult] = useState<{
    month: string;
    events: ParishEvent[];
  }>({ month: "", events: [] });

  useEffect(() => {
    let active = true;
    getPublicEvents(monthKey)
      .then((events) => {
        if (active) setEventResult({ month: monthKey, events });
      })
      .catch(() => {
        if (active) setEventResult({ month: monthKey, events: [] });
      });

    return () => {
      active = false;
    };
  }, [monthKey]);

  const calendarEvents = useMemo(
    () => eventsByDate(eventResult.month === monthKey ? eventResult.events : []),
    [eventResult, monthKey],
  );

  const bookingsByDate = useMemo(
    () =>
      bookings.reduce<Record<string, ProfileBooking[]>>((result, booking) => {
        if (booking.booking_date) {
          (result[booking.booking_date] ??= []).push(booking);
        }
        return result;
      }, {}),
    [bookings],
  );

  const dateKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const cells = Array.from(
    { length: firstDay + daysInMonth },
    (_, index) => (index < firstDay ? null : index - firstDay + 1),
  );

  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="text-[#B22222]" />
          <h2 className="font-serif text-xl font-bold">My Calendar</h2>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setDisplayedMonth(new Date(year, month - 1, 1))}
            className="rounded-lg p-1.5 hover:bg-gray-100"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setDisplayedMonth(new Date(year, month + 1, 1))}
            className="rounded-lg p-1.5 hover:bg-gray-100"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <p className="mb-4 text-center font-semibold text-[#B22222]">
        {displayedMonth.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <span key={`${day}-${index}`} className="py-1 font-semibold text-gray-400">
            {day}
          </span>
        ))}
        {cells.map((day, index) => {
          const dayBookings = day ? bookingsByDate[dateKey(day)] : undefined;
          const dayEvents = day ? calendarEvents[dateKey(day)] ?? [] : [];
          return day ? (
            <button
              type="button"
              key={day}
              aria-label={`${new Date(year, month, day).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}${dayEvents.length ? `, ${dayEvents.length} parish event${dayEvents.length === 1 ? "" : "s"}` : ""}`}
              className={`group relative flex aspect-square items-center justify-center rounded-lg transition hover:ring-1 hover:ring-[#B22222]/30 ${
                dayBookings
                  ? "bg-red-50 font-bold text-[#B22222]"
                  : dayEvents.length
                    ? "bg-violet-50 font-semibold text-violet-700"
                    : "text-gray-700"
              }`}
            >
              {day}
              {dayBookings && (
                <span className={`absolute bottom-1 size-1.5 rounded-full bg-[#B22222] ${dayEvents.length ? "left-[calc(50%_-_4px)]" : "left-1/2 -translate-x-1/2"}`} />
              )}
              {dayEvents.length > 0 && (
                <span className={`absolute bottom-1 size-1.5 rounded-full bg-violet-600 ${dayBookings ? "left-[calc(50%_+_4px)]" : "left-1/2 -translate-x-1/2"}`} />
              )}
              <CalendarEventTooltip
                events={dayEvents}
                alignment={new Date(year, month, day).getDay() === 0 ? "left" : new Date(year, month, day).getDay() === 6 ? "right" : "center"}
              />
            </button>
          ) : (
            <div key={`empty-${index}`} />
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
        <span className="h-2 w-2 rounded-full bg-[#B22222]" /> Your scheduled booking
        <span className="ml-2 h-2 w-2 rounded-full bg-violet-600" /> Parish event
      </div>
    </div>
  );
}
