import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { calendarBookings } from "../../data/calendar";
import type { BookingStatus, CalendarBooking } from "../../types/booking";

interface BookingCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const statusColors: Record<BookingStatus, string> = {
  available: "bg-green-500",
  limited: "bg-yellow-400",
  full: "bg-[#B22222]",
};

export default function BookingCalendar({
  selectedDate,
  onDateSelect,
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

  const bookings = useMemo<Record<string, CalendarBooking>>(
    () =>
      Object.fromEntries(
        calendarBookings.map((booking) => [booking.date, booking]),
      ),
    [],
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

  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg">
      {/* Header */}

      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => changeMonth(-1)}
          className="rounded-lg p-2 transition hover:bg-gray-100"
        >
          <ChevronLeft />
        </button>

        <h2 className="font-serif text-2xl font-bold text-[#B22222]">
          {monthName} {currentYear}
        </h2>

        <button
          onClick={() => changeMonth(1)}
          className="rounded-lg p-2 transition hover:bg-gray-100"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Weekdays */}

      <div className="mb-3 grid grid-cols-7 text-center text-sm font-semibold text-gray-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((weekday) => (
          <div key={weekday}>{weekday}</div>
        ))}
      </div>

      {/* Calendar */}

      <div className="space-y-2">
        {calendar.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2">
            {week.map((day, index) => {
              if (day === null) {
                return <div key={index} />;
              }

              const cellDate = new Date(currentYear, currentMonth, day);

              const booking = bookings[formatKey(cellDate)];

              const isSelected = isSameDate(selectedDate, cellDate);

              const isToday = isSameDate(new Date(), cellDate);

              const disabled =
                isPastDate(cellDate) || booking?.status === "full";

              return (
                <button
                  key={formatKey(cellDate)}
                  disabled={disabled}
                  onClick={() => onDateSelect(cellDate)}
                  className={`
                    relative aspect-square rounded-xl border
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
                      className={`absolute bottom-2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full ${
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

      <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span>Available</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span>Limited</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#B22222]" />
          <span>Fully Booked</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full ring-2 ring-blue-500" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
