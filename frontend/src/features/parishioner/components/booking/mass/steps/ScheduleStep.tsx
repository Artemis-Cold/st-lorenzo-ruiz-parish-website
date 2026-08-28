import { useEffect, useMemo, useRef, useState } from "react";
import { Clock3, MapPin } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import BookingCalendar from "../../BookingCalendar";
import { getPublicEvents, type ParishEvent } from "@/services/eventService";

import type { Dispatch, SetStateAction } from "react";
import type { MassIntentionBooking } from "../../../../types/mass";

interface ScheduleStepProps {
  booking: MassIntentionBooking;
  setBooking: Dispatch<SetStateAction<MassIntentionBooking>>;
  errors?: Record<string, string[]>;
  selectedMass: ParishEvent | null;
  setSelectedMass: Dispatch<SetStateAction<ParishEvent | null>>;
}

export default function ScheduleStep({
  booking,
  setBooking,
  errors,
  selectedMass,
  setSelectedMass,
}: ScheduleStepProps) {
  const [eventResult, setEventResult] = useState<{
    month: string;
    events: ParishEvent[];
  }>({ month: "", events: [] });
  const selectedDate = booking.intention_date;
  const selectedDateRef = useRef(selectedDate);
  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);
  const month = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}`
    : null;

  useEffect(() => {
    if (!month) return;

    let active = true;
    getPublicEvents(month)
      .then((items) => {
        if (!active) return;
        const massEvents = items.filter((event) => event.category === "mass");
        setEventResult({ month, events: massEvents });

        const currentDate = selectedDateRef.current;
        if (currentDate && currentDate.getDay() !== 0) {
          const key = formatDateKey(currentDate);
          const defaultMass = massEvents.find(
            (event) => event.startsAt.slice(0, 10) === key,
          );
          setSelectedMass(defaultMass ?? null);
          setBooking((previous) => ({
            ...previous,
            mass_event_id: defaultMass?.id ?? 0,
          }));
        }
      })
      .catch(() => {
        if (active) setEventResult({ month, events: [] });
      });

    return () => {
      active = false;
    };
  }, [month, setBooking, setSelectedMass]);

  const loadingSchedules = Boolean(month && eventResult.month !== month);

  const dateKey = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : null;
  const schedules = useMemo(() => {
    const events = eventResult.month === month ? eventResult.events : [];

    return dateKey
      ? events.filter((event) => event.startsAt.slice(0, 10) === dateKey)
      : [];
  }, [dateKey, eventResult, month]);
  const isSunday = selectedDate?.getDay() === 0;

  const selectDate = (date: Date) => {
    const dateMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const availableEvents =
      eventResult.month === dateMonth ? eventResult.events : [];
    const defaultMass =
      date.getDay() === 0
        ? null
        : (availableEvents.find(
            (event) => event.startsAt.slice(0, 10) === formatDateKey(date),
          ) ?? null);

    setSelectedMass(defaultMass);
    setBooking((previous) => ({
      ...previous,
      intention_date: date,
      mass_event_id: defaultMass?.id ?? 0,
    }));
  };

  const selectMass = (event: ParishEvent) => {
    setSelectedMass(event);
    setBooking((previous) => ({ ...previous, mass_event_id: event.id }));
  };

  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="grid gap-6 lg:h-124 lg:grid-cols-3 lg:items-stretch">
      <div className="min-h-0 lg:col-span-2">
        <BookingCalendar
          selectedDate={booking.intention_date ?? new Date()}
          onDateSelect={selectDate}
        />
      </div>

      <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-[#E7E2DA] bg-white p-5 shadow-lg">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B22222]">
              Mass offering
            </p>
            <h3 className="mt-1 font-serif text-xl font-bold text-[#292524]">
              {isSunday ? "Select Sunday Mass" : "Mass Schedule"}
            </h3>
          </div>
          <Clock3 className="shrink-0 text-[#B22222]" size={22} />
        </div>

        <div
          data-modal-scroll="true"
          className="min-h-0 flex-1 overflow-y-auto py-4 pr-1"
        >
          {!selectedDate ? (
            <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
              Select a date from the calendar first.
            </div>
          ) : loadingSchedules ? (
            <div
              aria-label="Loading Mass schedules"
              aria-busy="true"
              className="space-y-3"
            >
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
          ) : schedules.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-6 text-center text-sm leading-6 text-amber-800">
              No Mass schedule is available on this date. Please choose another
              date.
            </div>
          ) : isSunday ? (
            <div className="space-y-3">
              <p className="text-sm leading-5 text-gray-500">
                Sunday has multiple Masses. Choose the schedule where the
                intention will be offered.
              </p>
              {schedules.map((event) => {
                const selected = selectedMass?.id === event.id;
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => selectMass(event)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-[#B22222] bg-red-50 ring-2 ring-[#B22222]/10"
                        : "border-gray-200 hover:border-[#B22222]/50 hover:bg-red-50/40"
                    }`}
                  >
                    <p className="text-lg font-bold text-[#292524]">
                      {formatTime(event.startsAt)}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-[#B22222]">
                      {event.title}
                    </p>
                    <p className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
                      <MapPin size={14} className="mt-0.5 shrink-0" />
                      {event.location ?? "Parish Church"}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                Automatically selected
              </p>
              <p className="mt-2 text-2xl font-bold text-[#292524]">
                {formatTime(schedules[0].startsAt)}
              </p>
              <p className="mt-1 font-medium text-[#B22222]">
                {schedules[0].title}
              </p>
              <p className="mt-3 flex items-start gap-1.5 text-sm text-gray-600">
                <MapPin size={15} className="mt-0.5 shrink-0" />
                {schedules[0].location ?? "Parish Church"}
              </p>
              <p className="mt-4 text-xs leading-5 text-gray-500">
                Weekday and Saturday intentions use the parish's existing daily
                Mass schedule.
              </p>
            </div>
          )}
        </div>

        {(errors?.intention_date?.[0] || errors?.mass_event_id?.[0]) && (
          <div className="border-t border-gray-100 pt-3 text-sm text-red-600">
            {errors.intention_date?.[0] ?? errors.mass_event_id?.[0]}
          </div>
        )}
      </section>
    </div>
  );
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
