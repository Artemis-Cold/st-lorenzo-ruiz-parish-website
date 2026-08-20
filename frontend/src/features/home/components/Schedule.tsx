import { CalendarDays, ChevronLeft, ChevronRight, Church, Clock3, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

  const position = alignment === "left"
    ? "left-0"
    : alignment === "right"
      ? "right-0"
      : "left-1/2 -translate-x-1/2";

  return (
    <div role="tooltip" className={`pointer-events-none absolute bottom-full z-40 mb-2 hidden w-64 rounded-2xl bg-[#292524] p-3.5 text-left text-white shadow-2xl group-hover:block group-focus-visible:block ${position}`}>
      {events.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F5D76E]">Parish activities</p>
          <div className="space-y-2.5">
            {events.slice(0, 3).map((event) => (
              <div key={event.id}>
                <p className="text-xs font-semibold leading-4">{event.title}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-white/70"><Clock3 size={11} />{eventTime(event)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {services.length > 0 && (
        <div className={events.length > 0 ? "mt-3 border-t border-white/10 pt-3" : ""}>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-200">Booked services</p>
          <div className="space-y-1.5">
            {services.slice(0, 4).map((service) => (
              <p key={`${service.serviceCode}-${service.startTime}`} className="text-[11px] text-white/80">
                {service.displayName} · {formatTime(service.startTime)}{service.count > 1 ? ` · ${service.count} bookings` : ""}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Schedule() {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [events, setEvents] = useState<ParishEvent[]>([]);
  const [bookedDays, setBookedDays] = useState<PublicBookedServiceDay[]>([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.allSettled([getPublicEvents(monthKey), getPublicBookedServices(monthKey)])
      .then(([eventResult, bookingResult]) => {
        if (!active) return;

        const publicEvents = eventResult.status === "fulfilled" ? eventResult.value : [];
        const publicBookings = bookingResult.status === "fulfilled" ? bookingResult.value : [];
        setEvents(publicEvents);
        setBookedDays(publicBookings);

        const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
        const eventDates = Object.keys(eventsByDate(publicEvents)).filter((key) => key.startsWith(monthKey));
        const firstActivity = [...eventDates, ...publicBookings.map((day) => day.date)].sort()[0];
        setSelectedDay(isCurrentMonth ? now.getDate() : firstActivity ? Number(firstActivity.slice(-2)) : 1);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [month, monthKey, year]);

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

  if (week.length) calendar.push([...week, ...Array(7 - week.length).fill(null)]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  return (
    <section id="schedule" className="bg-[#F8F9FA] py-12 md:py-14">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-semibold uppercase tracking-[0.3em] text-[#B22222]">Parish life</span>
          <h2 className="mt-4 font-serif text-4xl font-bold text-gray-900 md:text-5xl">Events &amp; Monthly Activities</h2>
          <p className="mt-3 text-base leading-6 text-gray-600">Stay informed about parish events, community activities, and scheduled sacramental services.</p>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#D4AF37]" />
        </div>

        <div className="mx-auto mt-7 grid max-w-5xl overflow-visible rounded-3xl border border-gray-100 bg-white shadow-xl lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month" className="rounded-xl border border-gray-200 p-2 transition hover:border-red-200 hover:bg-red-50"><ChevronLeft /></button>
              <div className="text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B22222]">Parish calendar</p>
                <h3 className="mt-0.5 font-serif text-xl font-bold">{currentDate.toLocaleString("en-US", { month: "long" })} {year}</h3>
              </div>
              <button type="button" onClick={() => changeMonth(1)} aria-label="Next month" className="rounded-xl border border-gray-200 p-2 transition hover:border-red-200 hover:bg-red-50"><ChevronRight /></button>
            </div>

            <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-gray-400 sm:text-sm">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}
            </div>

            <div className="grid gap-1.5">
              {calendar.map((calendarWeek, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-1.5">
                  {calendarWeek.map((day, index) => {
                    if (day === null) return <div key={index} />;

                    const key = dateKey(year, month, day);
                    const dayEvents = calendarEvents[key] ?? [];
                    const dayServices = servicesByDate[key] ?? [];
                    const cellDate = new Date(year, month, day);
                    const isToday = cellDate.toDateString() === now.toDateString();
                    const isSelected = day === selectedDay;

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        aria-label={`${cellDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}, ${dayEvents.length} events, ${dayServices.length} booked service schedules`}
                        className={`group relative h-11 rounded-xl border transition-all sm:h-12 ${isSelected ? "border-[#B22222] bg-red-50 text-[#B22222] shadow-sm" : isToday ? "border-[#D4AF37] bg-amber-50/50" : "border-gray-200 hover:border-red-200 hover:bg-red-50/40"}`}
                      >
                        <span className="text-sm font-semibold sm:text-base">{day}</span>
                        {(dayEvents.length > 0 || dayServices.length > 0) && (
                          <span className="absolute inset-x-0 bottom-1.5 flex justify-center gap-1">
                            {dayEvents.length > 0 && <span className="h-1.5 w-4 rounded-full bg-[#D4AF37]" />}
                            {dayServices.length > 0 && <span className="h-1.5 w-4 rounded-full bg-[#B22222]" />}
                          </span>
                        )}
                        {dayEvents.length > 0 && <span className="absolute right-1.5 top-1 text-[9px] font-bold text-amber-600">{dayEvents.length}</span>}
                        <ActivityTooltip
                          events={dayEvents}
                          services={dayServices}
                          alignment={cellDate.getDay() === 0 ? "left" : cellDate.getDay() === 6 ? "right" : "center"}
                        />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-5 text-xs text-gray-600">
              <span className="flex items-center gap-2"><span className="h-2 w-5 rounded-full bg-[#D4AF37]" />Parish event</span>
              <span className="flex items-center gap-2"><span className="h-2 w-5 rounded-full bg-[#B22222]" />Booked service</span>
              {loading && <span className="text-gray-400">Updating calendar…</span>}
            </div>
          </div>

          <aside className="border-t border-gray-100 bg-[#FCFAF7] p-5 lg:border-l lg:border-t-0 lg:p-6">
            <div className="border-b border-[#E8E0D5] pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B22222]">Selected date</p>
              <h3 className="mt-1 font-serif text-xl font-bold text-gray-900">{selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</h3>
            </div>

            <div className="mt-4 max-h-[21rem] space-y-5 overflow-y-auto pr-1 [scrollbar-color:#D6CEC4_transparent] [scrollbar-width:thin]">
              {selectedEvents.length === 0 && selectedServices.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-9 text-center">
                  <CalendarDays className="mx-auto text-gray-300" size={30} />
                  <p className="mt-3 text-sm text-gray-500">No published activities for this date.</p>
                </div>
              ) : (
                <>
                  {selectedEvents.length > 0 && (
                    <section>
                      <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700"><CalendarDays size={15} />Parish activities</h4>
                      <div className="mt-3 space-y-3">
                        {selectedEvents.map((event) => (
                          <article key={event.id} className="rounded-2xl border border-amber-100 bg-white p-3.5">
                            <p className="text-sm font-bold text-gray-900">{event.title}</p>
                            <p className="mt-1.5 line-clamp-3 whitespace-pre-line text-xs leading-5 text-gray-500">{event.details}</p>
                            <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-600"><Clock3 size={13} />{eventTime(event)}</p>
                            {event.location && <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500"><MapPin size={13} /><span className="truncate">{event.location}</span></p>}
                          </article>
                        ))}
                      </div>
                    </section>
                  )}

                  {selectedServices.length > 0 && (
                    <section>
                      <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B22222]"><Church size={15} />Booked services</h4>
                      <div className="mt-3 space-y-2.5">
                        {selectedServices.map((service) => (
                          <article key={`${service.serviceCode}-${service.startTime}`} className="rounded-2xl border border-gray-200 bg-white p-3.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${serviceStyles[service.serviceCode]}`}>{service.displayName}</span>
                              {service.count > 1 && <span className="text-[11px] font-medium text-gray-500">{service.count} bookings</span>}
                            </div>
                            <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-600"><Clock3 size={13} />{formatTime(service.startTime)} – {formatTime(service.endTime)}</p>
                          </article>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
