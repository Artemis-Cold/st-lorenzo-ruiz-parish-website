import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

type BookingStatus = "available" | "limited" | "full";

interface CalendarDayStatus {
  status: BookingStatus;
  slots: number;
}

const schedule: Record<number, CalendarDayStatus> = {
  3: { status: "available", slots: 5 },
  5: { status: "limited", slots: 2 },
  8: { status: "full", slots: 0 },
  11: { status: "available", slots: 4 },
  14: { status: "full", slots: 0 },
  18: { status: "limited", slots: 1 },
  22: { status: "available", slots: 6 },
  25: { status: "full", slots: 0 },
  29: { status: "limited", slots: 2 },
};

const colors: Record<BookingStatus, string> = {
  available: "bg-green-500",
  limited: "bg-yellow-400",
  full: "bg-[#B22222]",
};

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
  });

  const year = currentDate.getFullYear();

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
    <section id="schedule" className="bg-[#F8F9FA] py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">
          <span className="font-semibold uppercase tracking-[0.3em] text-[#B22222]">
            St. Lorenzo Ruiz Parish
          </span>

          <h2 className="mt-4 font-serif text-4xl font-bold text-gray-900 md:text-5xl">
            Monthly Booking Schedule
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            View the current booking availability before submitting your
            request.
          </p>

          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-[#D4AF37]" />
        </div>

        {/* Calendar */}

        <div className="mx-auto mt-16 max-w-5xl rounded-3xl bg-white p-8 shadow-xl">
          {/* Header */}

          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={previousMonth}
              className="rounded-xl border border-gray-200 p-3 transition hover:bg-gray-100"
            >
              <ChevronLeft />
            </button>

            <h3 className="font-serif text-3xl font-bold">
              {monthName} {year}
            </h3>

            <button
              onClick={nextMonth}
              className="rounded-xl border border-gray-200 p-3 transition hover:bg-gray-100"
            >
              <ChevronRight />
            </button>
          </div>

          {/* Week Days */}

          <div className="mb-4 grid grid-cols-7 text-center font-semibold text-gray-500">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          {/* Calendar */}

          <div className="grid gap-3">
            {calendar.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-3">
                {week.map((day, index) => {
                  if (day === null) {
                    return <div key={index} />;
                  }

                  const booking = schedule[day];

                  const today = new Date();

                  const isToday =
                    day === today.getDate() &&
                    currentDate.getMonth() === today.getMonth() &&
                    currentDate.getFullYear() === today.getFullYear();

                  return (
                    <button
                      key={index}
                      className={`group relative aspect-square rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#B22222] hover:shadow-lg ${
                        isToday
                          ? "border-[#B22222] ring-2 ring-[#B22222]/20"
                          : "border-gray-200"
                      }`}
                    >
                      <span className="text-lg font-semibold text-gray-800">
                        {day}
                      </span>

                      {booking && (
                        <>
                          <span
                            className={`absolute bottom-3 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full ${colors[booking.status]}`}
                          />

                          <span className="absolute top-2 right-2 text-[10px] text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                            {booking.slots}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}

          <div className="mt-10 flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full bg-green-500" />
              <span>Available</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full bg-yellow-400" />
              <span>Limited Slots</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full bg-[#B22222]" />
              <span>Fully Booked</span>
            </div>
          </div>

          {/* CTA */}

          <div className="mt-12 text-center">
            <button className="rounded-xl bg-[#B22222] px-8 py-4 font-semibold text-white shadow-lg transition hover:bg-[#981B1B]">
              Book a Parish Service
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
