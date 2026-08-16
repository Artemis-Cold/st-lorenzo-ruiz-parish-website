import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { BookingStatus } from "../../types/booking";
import {
  getBookingAvailability,
  type BookingAvailability,
} from "../../../../services/bookingSlotService";

interface BookingCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  service?: string;
}

const statusColors: Record<BookingStatus, string> = {
  available: "bg-green-500",
  limited: "bg-yellow-400",
  full: "bg-[#B22222]",
};

export default function BookingCalendar({
  selectedDate,
  onDateSelect,
  service,
}: BookingCalendarProps) {
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const monthName = selectedDate.toLocaleString("en-US", {
    month: "long",
  });

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

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

  while (week.length && week.length < 7) {
    week.push(null);
  }

  if (week.length) {
    calendar.push(week);
  }

  const [availabilityResult, setAvailabilityResult] = useState<{
    key: string;
    days: BookingAvailability[];
  }>({ key: "", days: [] });

  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const requestKey = `${service ?? ""}:${monthKey}`;
  const loading = !!service && availabilityResult.key !== requestKey;

  useEffect(() => {
    if (!service) return;

    let active = true;

    const loadAvailability = () => {
      getBookingAvailability(service, monthKey)
        .then((days) => {
          if (active) setAvailabilityResult({ key: requestKey, days });
        })
        .catch(() => {
          if (active) setAvailabilityResult({ key: requestKey, days: [] });
        });
    };

    loadAvailability();
    window.addEventListener("focus", loadAvailability);

    return () => {
      active = false;
      window.removeEventListener("focus", loadAvailability);
    };
  }, [service, monthKey, requestKey]);

  const bookings = useMemo<Record<string, BookingAvailability>>(
    () =>
      availabilityResult.key === requestKey
        ? Object.fromEntries(
            availabilityResult.days.map((day) => [day.date, day]),
          )
        : {},
    [availabilityResult, requestKey],
  );

  const changeMonth = (offset: number) => {
    onDateSelect(new Date(currentYear, currentMonth + offset, 1));
  };

  const formatKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const isSameDate = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date < today;
  };

  const today = new Date();
  const isCurrentMonth =
    currentMonth === today.getMonth() && currentYear === today.getFullYear();

  return (
    <div className="rounded-3xl bg-white p-4 shadow-lg sm:p-5">
      {/* Header */}

      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          disabled={isCurrentMonth}
          aria-label="Previous month"
          className="rounded-lg p-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft />
        </button>

        <h2 className="font-serif text-xl font-bold text-[#B22222] sm:text-2xl">
          {monthName} {currentYear}
        </h2>

        <button
          type="button"
          onClick={() => changeMonth(1)}
          aria-label="Next month"
          className="rounded-lg p-2 transition hover:bg-gray-100"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Weekdays */}

      <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-gray-500 sm:text-sm">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((weekday) => (
          <div key={weekday}>{weekday}</div>
        ))}
      </div>

      {/* Calendar */}

      <div className="space-y-1.5">
        {calendar.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1.5">
            {week.map((day, index) => {
              if (day === null) {
                return <div key={index} />;
              }

              const cellDate = new Date(currentYear, currentMonth, day);

              const booking = bookings[formatKey(cellDate)];

              const isSelected = isSameDate(selectedDate, cellDate);

              const isToday = isSameDate(new Date(), cellDate);

              const disabled =
                isPastDate(cellDate) ||
                (!!service && (!booking || booking.status === "full"));

              return (
                <button
                  key={formatKey(cellDate)}
                  disabled={disabled}
                  onClick={() => onDateSelect(cellDate)}
                  className={`
                    relative h-10 rounded-lg border sm:h-11 md:h-12
                    transition-all duration-200
                    hover:-translate-y-0.5 hover:shadow-md

                    ${
                      disabled
                        ? "cursor-not-allowed bg-gray-100 text-gray-400"
                        : ""
                    }

                    ${
                      isSelected
                        ? "border-[#B22222] bg-[#B22222] text-white"
                        : "border-gray-200 hover:border-[#B22222]"
                    }
                  `}
                >
                  <span>{day}</span>

                  {booking && (
                    <span
                      title={`${booking.remaining} of ${booking.capacity} slots remaining`}
                      className={`absolute bottom-1.5 left-1/2 h-1.5 w-5 -translate-x-1/2 rounded-full shadow-sm ${
                        statusColors[booking.status]
                      }`}
                    />
                  )}

                  {isToday && !isSelected && (
                    <span className="absolute inset-1 rounded-lg ring-2 ring-blue-500" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}

      <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs sm:text-sm">
        {service && loading && (
          <span className="text-gray-500">Loading availability...</span>
        )}
        {service && (
          <>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span>Available</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span>Limited (50% or less)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#B22222]" />
              <span>Fully Booked</span>
            </div>
          </>
        )}

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full ring-2 ring-blue-500" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
