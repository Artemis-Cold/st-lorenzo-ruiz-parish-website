import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Church,
  Clock3,
  MapPin,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Skeleton } from "@/components/ui/skeleton";
import { getPublicEvents, type ParishEvent } from "@/services/eventService";
import {
  getPublicBookedServices,
  type PublicBookedService,
  type PublicBookedServiceDay,
} from "@/services/parishCalendarService";
import { eventsByDate, eventTime } from "@/utils/eventCalendar";

const dateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const formatTime = (value: string) => {
  const [hour, minute] = value.split(":").map(Number);
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const serviceStyles: Record<PublicBookedService["serviceCode"], string> = {
  baptism: "bg-sky-50 text-sky-700 ring-sky-200",
  wedding: "bg-rose-50 text-rose-700 ring-rose-200",
  funeral: "bg-violet-50 text-violet-700 ring-violet-200",
};

function ActivityTooltip({
  events,
  services,
  alignment,
}: {
  events: ParishEvent[];
  services: PublicBookedService[];
  alignment: "left" | "center" | "right";
}) {
  if (events.length === 0 && services.length === 0) return null;

  const position =
    alignment === "left"
      ? "left-0"
      : alignment === "right"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";

  return (
    <div
      role="tooltip"
      className={`pointer-events-none invisible absolute bottom-full z-40 mb-2 hidden w-64 translate-y-2 rounded-2xl bg-[#292524] p-3.5 text-left text-white opacity-0 shadow-2xl transition-all duration-200 sm:block sm:group-hover:visible sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-visible:visible sm:group-focus-visible:translate-y-0 sm:group-focus-visible:opacity-100 ${position}`}
    >
      {events.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F5D76E]">
            Parish activities
          </p>
          <div className="space-y-2.5">
            {events.slice(0, 3).map((event) => (
              <div key={event.id}>
                <p className="text-xs font-semibold leading-4">{event.title}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-white/70">
                  <Clock3 size={11} />
                  {eventTime(event)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {services.length > 0 && (
        <div
          className={
            events.length > 0 ? "mt-3 border-t border-white/10 pt-3" : ""
          }
        >
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-200">
            Booked services
          </p>
          <div className="space-y-1.5">
            {services.slice(0, 4).map((service) => (
              <p
                key={`${service.serviceCode}-${service.startTime}`}
                className="text-[11px] text-white/80"
              >
                {service.displayName} · {formatTime(service.startTime)}
                {service.count > 1 ? ` · ${service.count} bookings` : ""}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Schedule() {
  const [today] = useState(() => new Date());
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [events, setEvents] = useState<ParishEvent[]>([]);
  const [bookedDays, setBookedDays] = useState<PublicBookedServiceDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthDirection, setMonthDirection] = useState(1);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      getPublicEvents(monthKey),
      getPublicBookedServices(monthKey),
    ])
      .then(([eventResult, bookingResult]) => {
        if (!active) return;

        const publicEvents =
          eventResult.status === "fulfilled" ? eventResult.value : [];
        const publicBookings =
          bookingResult.status === "fulfilled" ? bookingResult.value : [];
        setEvents(publicEvents);
        setBookedDays(publicBookings);

        const isCurrentMonth =
          year === today.getFullYear() && month === today.getMonth();
        const eventDates = Object.keys(eventsByDate(publicEvents)).filter(
          (key) => key.startsWith(monthKey),
        );
        const firstActivity = [
          ...eventDates,
          ...publicBookings.map((day) => day.date),
        ].sort()[0];
        setSelectedDay(
          isCurrentMonth
            ? today.getDate()
            : firstActivity
              ? Number(firstActivity.slice(-2))
              : 1,
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [month, monthKey, today, year]);

  const calendarEvents = useMemo(() => eventsByDate(events), [events]);
  const servicesByDate = useMemo(
    () => Object.fromEntries(bookedDays.map((day) => [day.date, day.services])),
    [bookedDays],
  );

  const selectedKey = dateKey(year, month, selectedDay);
  const selectedEvents = calendarEvents[selectedKey] ?? [];
  const selectedServices = servicesByDate[selectedKey] ?? [];
  const selectedDate = new Date(year, month, selectedDay);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendar: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      calendar.push(week);
      week = [];
    }
  }

  if (week.length)
    calendar.push([...week, ...Array(7 - week.length).fill(null)]);

  const changeMonth = (offset: number) => {
    setLoading(true);
    setMonthDirection(offset);
    setSelectedDay(1);
    setCurrentDate(new Date(year, month + offset, 1));
  };

  return (
    <section id="schedule" className="bg-[#F8F9FA] py-12 md:py-14">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="font-semibold uppercase tracking-[0.3em] text-[#B22222]">
            Parish life
          </span>
          <h2 className="mt-4 font-serif text-4xl font-bold text-gray-900 md:text-5xl">
            Events &amp; Monthly Activities
          </h2>
          <p className="mt-3 text-base leading-6 text-gray-600">
            Stay informed about parish events, community activities, and
            scheduled sacramental services.
          </p>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#D4AF37]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.65, delay: 0.08, ease: "easeOut" }}
          className="mx-auto mt-7 grid max-w-5xl overflow-visible rounded-3xl border border-gray-100 bg-white shadow-xl transition-shadow duration-500 hover:shadow-2xl lg:grid-cols-[minmax(0,1fr)_300px]"
        >
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <motion.button
                type="button"
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
                whileHover={{ x: -2, scale: 1.04 }}
                whileTap={{ scale: 0.92 }}
                className="rounded-xl border border-gray-200 p-2 transition-colors hover:border-red-200 hover:bg-red-50"
              >
                <ChevronLeft />
              </motion.button>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`heading-${monthKey}`}
                  initial={{ opacity: 0, x: monthDirection * 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: monthDirection * -12 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  className="text-center"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B22222]">
                    Parish calendar
                  </p>
                  <h3 className="mt-0.5 font-serif text-xl font-bold">
                    {currentDate.toLocaleString("en-US", { month: "long" })}{" "}
                    {year}
                  </h3>
                </motion.div>
              </AnimatePresence>
              <motion.button
                type="button"
                onClick={() => changeMonth(1)}
                aria-label="Next month"
                whileHover={{ x: 2, scale: 1.04 }}
                whileTap={{ scale: 0.92 }}
                className="rounded-xl border border-gray-200 p-2 transition-colors hover:border-red-200 hover:bg-red-50"
              >
                <ChevronRight />
              </motion.button>
            </div>

            <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-gray-400 sm:text-sm">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="overflow-x-clip sm:overflow-visible">
              <AnimatePresence
                mode="wait"
                initial={false}
                custom={monthDirection}
              >
                <motion.div
                  key={monthKey}
                  custom={monthDirection}
                  initial={{ opacity: 0, x: monthDirection * 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: monthDirection * -24 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="grid gap-1.5"
                >
                  {calendar.map((calendarWeek, weekIndex) => (
                    <motion.div
                      key={weekIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: weekIndex * 0.025 }}
                      className="grid grid-cols-7 gap-1.5"
                    >
                      {calendarWeek.map((day, index) => {
                        if (day === null) return <div key={index} />;

                        const key = dateKey(year, month, day);
                        const dayEvents = calendarEvents[key] ?? [];
                        const dayServices = servicesByDate[key] ?? [];
                        const cellDate = new Date(year, month, day);
                        const isToday =
                          cellDate.toDateString() === today.toDateString();
                        const isSelected = day === selectedDay;

                        return (
                          <motion.button
                            key={key}
                            type="button"
                            onClick={() => setSelectedDay(day)}
                            whileHover={{ y: -2, scale: 1.025 }}
                            whileTap={{ scale: 0.94 }}
                            aria-label={`${cellDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}, ${dayEvents.length} events, ${dayServices.length} booked service schedules`}
                            className={`group relative h-11 rounded-xl border transition-[border-color,background-color,color,box-shadow] duration-200 sm:h-12 ${isSelected ? "border-[#B22222] bg-red-50 text-[#B22222] shadow-sm" : isToday ? "border-[#D4AF37] bg-amber-50/50" : "border-gray-200 hover:border-red-200 hover:bg-red-50/40"}`}
                          >
                            <span className="text-sm font-semibold sm:text-base">
                              {day}
                            </span>
                            {isSelected && (
                              <motion.span
                                layoutId="landing-calendar-selection"
                                className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-[#B22222]/15"
                                transition={{
                                  type: "spring",
                                  stiffness: 420,
                                  damping: 32,
                                }}
                              />
                            )}
                            {(dayEvents.length > 0 ||
                              dayServices.length > 0) && (
                              <span className="absolute inset-x-0 bottom-1.5 flex justify-center gap-1">
                                {dayEvents.length > 0 && (
                                  <span className="h-1.5 w-4 rounded-full bg-[#D4AF37]" />
                                )}
                                {dayServices.length > 0 && (
                                  <span className="h-1.5 w-4 rounded-full bg-[#B22222]" />
                                )}
                              </span>
                            )}
                            {dayEvents.length > 0 && (
                              <span className="absolute right-1.5 top-1 text-[9px] font-bold text-amber-600">
                                {dayEvents.length}
                              </span>
                            )}
                            <ActivityTooltip
                              events={dayEvents}
                              services={dayServices}
                              alignment={
                                cellDate.getDay() === 0
                                  ? "left"
                                  : cellDate.getDay() === 6
                                    ? "right"
                                    : "center"
                              }
                            />
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-5 text-xs text-gray-600">
              <span className="flex items-center gap-2">
                <span className="h-2 w-5 rounded-full bg-[#D4AF37]" />
                Parish event
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-5 rounded-full bg-[#B22222]" />
                Booked service
              </span>
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    aria-label="Updating calendar"
                    aria-busy="true"
                  >
                    <Skeleton className="h-3 w-24" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <aside className="border-t border-gray-100 bg-[#FCFAF7] p-5 lg:border-l lg:border-t-0 lg:p-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`date-${selectedKey}`}
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="border-b border-[#E8E0D5] pb-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B22222]">
                  Selected date
                </p>
                <h3 className="mt-1 font-serif text-xl font-bold text-gray-900">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
              </motion.div>
            </AnimatePresence>

            <div className="mt-4 max-h-[21rem] space-y-5 overflow-y-auto pr-1 [scrollbar-color:#D6CEC4_transparent] [scrollbar-width:thin]">
              <AnimatePresence mode="wait" initial={false}>
                {selectedEvents.length === 0 &&
                selectedServices.length === 0 ? (
                  <motion.div
                    key={`empty-${selectedKey}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.24 }}
                    className="rounded-2xl border border-dashed border-gray-300 px-4 py-9 text-center"
                  >
                    <CalendarDays className="mx-auto text-gray-300" size={30} />
                    <p className="mt-3 text-sm text-gray-500">
                      No published activities for this date.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`activities-${selectedKey}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.26 }}
                    className="space-y-5"
                  >
                    {selectedEvents.length > 0 && (
                      <section>
                        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
                          <CalendarDays size={15} />
                          Parish activities
                        </h4>
                        <div className="mt-3 space-y-3">
                          {selectedEvents.map((event, index) => (
                            <motion.article
                              key={event.id}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.04 }}
                              whileHover={{ x: 3 }}
                              className="rounded-2xl border border-amber-100 bg-white p-3.5 transition-shadow hover:shadow-sm"
                            >
                              <p className="text-sm font-bold text-gray-900">
                                {event.title}
                              </p>
                              <p className="mt-1.5 line-clamp-3 whitespace-pre-line text-xs leading-5 text-gray-500">
                                {event.details}
                              </p>
                              <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-600">
                                <Clock3 size={13} />
                                {eventTime(event)}
                              </p>
                              {event.location && (
                                <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                                  <MapPin size={13} />
                                  <span className="truncate">
                                    {event.location}
                                  </span>
                                </p>
                              )}
                            </motion.article>
                          ))}
                        </div>
                      </section>
                    )}

                    {selectedServices.length > 0 && (
                      <section>
                        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B22222]">
                          <Church size={15} />
                          Booked services
                        </h4>
                        <div className="mt-3 space-y-2.5">
                          {selectedServices.map((service, index) => (
                            <motion.article
                              key={`${service.serviceCode}-${service.startTime}`}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.04 }}
                              whileHover={{ x: 3 }}
                              className="rounded-2xl border border-gray-200 bg-white p-3.5 transition-shadow hover:shadow-sm"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${serviceStyles[service.serviceCode]}`}
                                >
                                  {service.displayName}
                                </span>
                                {service.count > 1 && (
                                  <span className="text-[11px] font-medium text-gray-500">
                                    {service.count} bookings
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-600">
                                <Clock3 size={13} />
                                {formatTime(service.startTime)} –{" "}
                                {formatTime(service.endTime)}
                              </p>
                            </motion.article>
                          ))}
                        </div>
                      </section>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </aside>
        </motion.div>
      </div>
    </section>
  );
}
