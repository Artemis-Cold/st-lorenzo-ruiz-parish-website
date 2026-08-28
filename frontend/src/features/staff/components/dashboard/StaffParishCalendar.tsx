import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Church,
  Clock3,
  MapPin,
  RefreshCw,
  X,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { getPublicEvents, type ParishEvent } from "@/services/eventService";
import {
  getPublicBookedServices,
  type PublicBookedService,
  type PublicBookedServiceDay,
} from "@/services/parishCalendarService";
import { eventsByDate, eventTime } from "@/utils/eventCalendar";

interface CalendarMonthData {
  events: ParishEvent[];
  bookedDays: PublicBookedServiceDay[];
}

interface CachedMonth {
  data: CalendarMonthData;
  expiresAt: number;
}

const CACHE_DURATION = 2 * 60 * 1000;
const monthCache = new Map<string, CachedMonth>();
const pendingMonths = new Map<string, Promise<CalendarMonthData>>();

const serviceStyles: Record<PublicBookedService["serviceCode"], string> = {
  baptism: "bg-sky-50 text-sky-700 ring-sky-200",
  wedding: "bg-rose-50 text-rose-700 ring-rose-200",
  funeral: "bg-violet-50 text-violet-700 ring-violet-200",
};

const monthKeyFor = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const dateKeyFor = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const formatServiceTime = (value: string) => {
  const [hour, minute] = value.split(":").map(Number);
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
};

async function fetchCalendarMonth(
  month: string,
  force = false,
): Promise<CalendarMonthData> {
  if (force) {
    monthCache.delete(month);
    pendingMonths.delete(month);
  }

  const cached = monthCache.get(month);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const pending = pendingMonths.get(month);
  if (pending) return pending;

  const request = Promise.all([
    getPublicEvents(month),
    getPublicBookedServices(month),
  ])
    .then(([events, bookedDays]) => {
      const data = { events, bookedDays };
      monthCache.set(month, {
        data,
        expiresAt: Date.now() + CACHE_DURATION,
      });
      return data;
    })
    .finally(() => pendingMonths.delete(month));

  pendingMonths.set(month, request);
  return request;
}

function buildCalendar(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    weeks.push([...week, ...Array(7 - week.length).fill(null)]);
  }

  return weeks;
}

export default function StaffParishCalendar() {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [result, setResult] = useState<{
    key: string;
    data: CalendarMonthData;
  }>({ key: "", data: { events: [], bookedDays: [] } });
  const [failedMonth, setFailedMonth] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const monthKey = monthKeyFor(visibleMonth);
  const loading = result.key !== monthKey;

  useEffect(() => {
    let active = true;

    fetchCalendarMonth(monthKey, refreshVersion > 0)
      .then((data) => {
        if (!active) return;
        setResult({ key: monthKey, data });
        setFailedMonth(null);
      })
      .catch(() => {
        if (active) setFailedMonth(monthKey);
      });

    return () => {
      active = false;
    };
  }, [monthKey, refreshVersion]);

  const monthData =
    result.key === monthKey ? result.data : { events: [], bookedDays: [] };
  const calendarEvents = useMemo(
    () => eventsByDate(monthData.events),
    [monthData.events],
  );
  const servicesByDate = useMemo(
    () =>
      Object.fromEntries(
        monthData.bookedDays.map((day) => [day.date, day.services]),
      ) as Record<string, PublicBookedService[]>,
    [monthData.bookedDays],
  );
  const calendar = useMemo(() => buildCalendar(year, month), [month, year]);

  const changeMonth = (offset: number) => {
    setSelectedDateKey(null);
    setRefreshVersion(0);
    setVisibleMonth(new Date(year, month + offset, 1));
  };

  const refresh = () => {
    setResult((current) =>
      current.key === monthKey ? { ...current, key: "" } : current,
    );
    setRefreshVersion((version) => version + 1);
  };

  const selectedEvents = selectedDateKey
    ? (calendarEvents[selectedDateKey] ?? [])
    : [];
  const selectedServices = selectedDateKey
    ? (servicesByDate[selectedDateKey] ?? [])
    : [];

  return (
    <>
      <section className="h-full overflow-hidden rounded-3xl border border-[#E7E2DA] bg-white shadow-sm">
        <header className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-red-50 text-[#B22222]">
              <CalendarDays size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-[#B22222]">
                Parish operations
              </p>
              <h2 className="truncate font-serif text-lg font-bold text-[#292524]">
                Parish Calendar
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            aria-label="Refresh calendar"
            title="Refresh calendar"
            className="grid size-8 shrink-0 place-items-center rounded-xl border border-gray-200 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-[#B22222] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </header>

        <div className="p-3.5 sm:p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label="Previous month"
              className="grid size-8 place-items-center rounded-xl border border-gray-200 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-[#B22222]"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="text-center">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                Month
              </p>
              <h3 className="font-serif text-base font-bold text-[#292524] sm:text-lg">
                {visibleMonth.toLocaleString("en-PH", { month: "long" })} {year}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="Next month"
              className="grid size-8 place-items-center rounded-xl border border-gray-200 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-[#B22222]"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="mb-1.5 grid grid-cols-7 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-400 sm:text-[10px]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="relative space-y-1">
            {calendar.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => {
                  if (day === null) {
                    return (
                      <div
                        key={`empty-${weekIndex}-${dayIndex}`}
                        className="h-8 sm:h-9 xl:h-8"
                      />
                    );
                  }

                  const key = dateKeyFor(year, month, day);
                  const events = calendarEvents[key] ?? [];
                  const services = servicesByDate[key] ?? [];
                  const cellDate = new Date(year, month, day);
                  const isToday =
                    cellDate.toDateString() === today.toDateString();
                  const activityCount =
                    events.length +
                    services.reduce(
                      (count, service) => count + service.count,
                      0,
                    );

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDateKey(key)}
                      aria-label={`${cellDate.toLocaleDateString("en-PH", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}: ${events.length} activities and ${services.length} service schedules`}
                      className={`group relative h-8 rounded-lg border px-1 py-0.5 text-left transition sm:h-9 xl:h-8 ${
                        isToday
                          ? "border-[#D4AF37] bg-amber-50/60"
                          : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50/40 hover:shadow-sm"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold sm:text-[11px] ${isToday ? "text-amber-800" : "text-gray-700"}`}
                      >
                        {day}
                      </span>
                      {activityCount > 0 && (
                        <span className="absolute right-1 top-0.5 hidden rounded-full bg-gray-100 px-1 text-[7px] font-bold text-gray-500 md:block">
                          {activityCount}
                        </span>
                      )}
                      {(events.length > 0 || services.length > 0) && (
                        <span className="absolute inset-x-1 bottom-0.5 flex gap-0.5">
                          {events.length > 0 && (
                            <span className="h-0.5 min-w-0 flex-1 rounded-full bg-[#D4AF37]" />
                          )}
                          {services.length > 0 && (
                            <span className="h-0.5 min-w-0 flex-1 rounded-full bg-[#B22222]" />
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {loading && (
              <div
                aria-label="Loading parish calendar"
                aria-busy="true"
                className="absolute inset-0 grid grid-cols-7 gap-1 rounded-2xl bg-white/90 p-1 backdrop-blur-[1px]"
              >
                {Array.from({ length: 42 }, (_, index) => (
                  <Skeleton key={index} className="h-8 rounded-lg" />
                ))}
              </div>
            )}
          </div>

          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-gray-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-4 rounded-full bg-[#D4AF37]" /> Parish
              activity
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-4 rounded-full bg-[#B22222]" /> Booked
              service
            </span>
            {failedMonth === monthKey && (
              <span className="font-medium text-red-600">
                Calendar could not be loaded. Select Refresh to try again.
              </span>
            )}
          </div>
        </div>
      </section>

      <DateActivityModal
        dateKey={selectedDateKey}
        events={selectedEvents}
        services={selectedServices}
        onClose={() => setSelectedDateKey(null)}
      />
    </>
  );
}

function DateActivityModal({
  dateKey,
  events,
  services,
  onClose,
}: {
  dateKey: string | null;
  events: ParishEvent[];
  services: PublicBookedService[];
  onClose: () => void;
}) {
  useEffect(() => {
    if (!dateKey) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [dateKey, onClose]);

  if (!dateKey) return null;

  const selectedDate = new Date(`${dateKey}T00:00:00`);

  return (
    <div
      data-app-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-calendar-modal-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B22222]">
              Daily schedule
            </p>
            <h2
              id="staff-calendar-modal-title"
              className="mt-1 font-serif text-2xl font-bold text-[#292524]"
            >
              {selectedDate.toLocaleDateString("en-PH", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close schedule details"
            className="grid size-10 shrink-0 place-items-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </header>

        <div
          data-modal-scroll="true"
          className="min-h-0 overflow-y-auto px-5 py-6 sm:px-7"
        >
          {events.length === 0 && services.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 px-5 py-12 text-center">
              <CalendarDays className="mx-auto text-gray-300" size={34} />
              <p className="mt-3 font-medium text-gray-700">
                No scheduled activities
              </p>
              <p className="mt-1 text-sm text-gray-500">
                There are no events or booked services recorded for this date.
              </p>
            </div>
          ) : (
            <div className="space-y-7">
              {events.length > 0 && (
                <section>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 font-semibold text-[#292524]">
                      <CalendarDays size={18} className="text-amber-700" />
                      Events and Masses
                    </h3>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      {events.length}
                    </span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {events.map((event) => (
                      <article
                        key={event.id}
                        className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 sm:p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="font-bold text-[#292524]">
                            {event.title}
                          </p>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
                            {event.category === "mass" ? "Mass" : "Event"}
                          </span>
                        </div>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                          {event.details}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-600">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 size={14} /> {eventTime(event)}
                          </span>
                          {event.location && (
                            <span className="inline-flex min-w-0 items-center gap-1.5">
                              <MapPin size={14} className="shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {services.length > 0 && (
                <section>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 font-semibold text-[#292524]">
                      <Church size={18} className="text-[#B22222]" />
                      Booked Services
                    </h3>
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-[#B22222]">
                      {services.reduce(
                        (count, service) => count + service.count,
                        0,
                      )}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {services.map((service) => (
                      <article
                        key={`${service.serviceCode}-${service.startTime}`}
                        className="rounded-2xl border border-gray-200 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${serviceStyles[service.serviceCode]}`}
                          >
                            {service.displayName}
                          </span>
                          {service.count > 1 && (
                            <span className="text-xs font-medium text-gray-500">
                              {service.count} bookings
                            </span>
                          )}
                        </div>
                        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                          <Clock3 size={15} className="text-[#B22222]" />
                          {formatServiceTime(service.startTime)} –{" "}
                          {formatServiceTime(service.endTime)}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
