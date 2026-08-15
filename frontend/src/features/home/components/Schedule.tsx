import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getBookingAvailability } from "@/services/bookingSlotService";
import { getPublicEvents, type ParishEvent } from "@/services/eventService";
import { eventsByDate } from "@/utils/eventCalendar";
import CalendarEventTooltip from "@/components/events/CalendarEventTooltip";

type BookingStatus = "available" | "limited" | "full";

interface CalendarDayStatus {
  status: BookingStatus;
  slots: number;
}

const colors: Record<BookingStatus, string> = {
  available: "bg-green-500",
  limited: "bg-yellow-400",
  full: "bg-[#B22222]",
};

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<Record<number, CalendarDayStatus>>({});
  const [events, setEvents] = useState<ParishEvent[]>([]);

  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
  });

  const year = currentDate.getFullYear();

  useEffect(() => {
    const month = `${year}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
    Promise.all([
      Promise.all(["wedding", "baptism", "funeral"].map((service) => getBookingAvailability(service, month))),
      getPublicEvents(month),
    ])
      .then(([results, publicEvents]) => {
        const days: Record<number, { capacity: number; remaining: number }> = {};
        results.flat().forEach((availability) => {
          const day = Number(availability.date.slice(-2));
          days[day] ??= { capacity: 0, remaining: 0 };
          days[day].capacity += availability.capacity;
          days[day].remaining += availability.remaining;
        });
        setSchedule(Object.fromEntries(Object.entries(days).map(([day, value]) => [day, {
          slots: value.remaining,
          status: value.remaining === 0 ? "full" : value.remaining / value.capacity <= 0.25 ? "limited" : "available",
        }])));
        setEvents(publicEvents);
      })
      .catch(() => {
        setSchedule({});
        setEvents([]);
      });
  }, [currentDate, year]);

  const calendarEvents = useMemo(() => eventsByDate(events), [events]);

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const firstDay = new Date(year, currentDate.getMonth(), 1).getDay();

  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();

  const calendar: (number | null)[][] = [];

  let week: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    week.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);

    if (week.length === 7) {
      calendar.push(week);
      week = [];
    }
  }

  while (week.length > 0 && week.length < 7) {
    week.push(null);
  }

  if (week.length) {
    calendar.push(week);
  }

  return (
    <section id="schedule" className="bg-[#F8F9FA] py-12 md:py-14">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">
          <span className="font-semibold uppercase tracking-[0.3em] text-[#B22222]">
            St. Lorenzo Ruiz Parish
          </span>

          <h2 className="mt-4 font-serif text-4xl font-bold text-gray-900 md:text-5xl">
            Parish Calendar &amp; Booking Schedule
          </h2>

          <p className="mt-3 text-base leading-6 text-gray-600">
            View parish events alongside the current service availability.
          </p>

          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#D4AF37]" />
        </div>

        {/* Calendar */}

        <div className="mx-auto mt-6 max-w-3xl rounded-3xl bg-white p-4 shadow-lg sm:p-5">
          {/* Header */}

          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={previousMonth}
              className="rounded-xl border border-gray-200 p-2 transition hover:bg-gray-100"
            >
              <ChevronLeft />
            </button>

            <h3 className="font-serif text-xl font-bold">
              {monthName} {year}
            </h3>

            <button
              onClick={nextMonth}
              className="rounded-xl border border-gray-200 p-2 transition hover:bg-gray-100"
            >
              <ChevronRight />
            </button>
          </div>

          {/* Week Days */}

          <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-gray-500 sm:text-sm">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          {/* Calendar */}

          <div className="grid gap-1.5">
            {calendar.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1.5">
                {week.map((day, index) => {
                  if (day === null) {
                    return <div key={index} />;
                  }

                  const booking = schedule[day];
                  const cellDate = new Date(year, currentDate.getMonth(), day);
                  const key = `${year}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const dayEvents = calendarEvents[key] ?? [];

                  const today = new Date();

                  const isToday =
                    day === today.getDate() &&
                    currentDate.getMonth() === today.getMonth() &&
                    currentDate.getFullYear() === today.getFullYear();

                  return (
                    <button
                      key={index}
                      type="button"
                      aria-label={`${cellDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}${dayEvents.length ? `, ${dayEvents.length} parish event${dayEvents.length === 1 ? "" : "s"}` : ""}`}
                      className={`group relative h-10 rounded-lg border bg-white transition-all duration-300 hover:border-[#B22222] hover:shadow-md sm:h-11 ${
                        isToday
                          ? "border-[#B22222] ring-2 ring-[#B22222]/20"
                          : "border-gray-200"
                      }`}
                    >
                      <span className="text-sm font-semibold text-gray-800 sm:text-base">
                        {day}
                      </span>

                      {booking && (
                        <>
                          <span
                            className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${dayEvents.length ? "left-[calc(50%_-_5px)]" : "left-1/2 -translate-x-1/2"} ${colors[booking.status]}`}
                          />

                          <span className="absolute top-2 right-2 text-[10px] text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                            {booking.slots}
                          </span>
                        </>
                      )}

                      {dayEvents.length > 0 && (
                        <span className={`absolute bottom-1.5 size-2 rounded-full bg-violet-600 ring-2 ring-white ${booking ? "left-[calc(50%_+_5px)]" : "left-1/2 -translate-x-1/2"}`} />
                      )}

                      <CalendarEventTooltip
                        events={dayEvents}
                        alignment={cellDate.getDay() === 0 ? "left" : cellDate.getDay() === 6 ? "right" : "center"}
                      />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}

          <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span>Available</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span>Limited (25% or less)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#B22222]" />
              <span>Fully Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-600" />
              <span>Parish Event</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
