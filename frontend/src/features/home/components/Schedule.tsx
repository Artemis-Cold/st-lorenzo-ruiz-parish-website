import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBookingAvailability } from "@/services/bookingSlotService";

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

  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
  });

  const year = currentDate.getFullYear();

  useEffect(() => {
    const month = `${year}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
    Promise.all(["wedding", "baptism", "funeral"].map((service) => getBookingAvailability(service, month)))
      .then((results) => {
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
      })
      .catch(() => setSchedule({}));
  }, [currentDate, year]);

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
    <section id="schedule" className="bg-[#F8F9FA] py-14 md:py-16 xl:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
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

        <div className="mx-auto mt-8 max-w-4xl rounded-3xl bg-white p-4 shadow-lg sm:p-5 md:p-6">
          {/* Header */}

          <div className="mb-5 flex items-center justify-between">
            <button
              onClick={previousMonth}
              className="rounded-xl border border-gray-200 p-2 transition hover:bg-gray-100"
            >
              <ChevronLeft />
            </button>

            <h3 className="font-serif text-xl font-bold sm:text-2xl">
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

          <div className="grid gap-1.5 sm:gap-2">
            {calendar.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1.5 sm:gap-2">
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
                      className={`group relative h-11 rounded-xl border bg-white transition-all duration-300 hover:border-[#B22222] hover:shadow-md sm:h-12 md:h-14 ${
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
                            className={`absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full sm:h-2 sm:w-2 ${colors[booking.status]}`}
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

          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span>Available</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span>Limited Slots</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#B22222]" />
              <span>Fully Booked</span>
            </div>
          </div>

          {/* CTA */}

          <div className="mt-7 text-center">
            <Link to="/login" className="inline-flex rounded-xl bg-[#B22222] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#981B1B]">
              Book a Parish Service
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
