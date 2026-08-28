import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Filter,
  Power,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import StaffDashboardLayout from "../components/dashboard/StaffDashboardLayout";
import {
  createStaffAvailability,
  deleteStaffAvailability,
  getStaffAvailability,
  updateStaffAvailability,
  type StaffAvailabilitySlot,
} from "@/services/staffAvailabilityService";

const WEEKDAY_SCHEDULE = "8:00 AM–12:00 PM and 1:00 PM–4:00 PM";
const SUNDAY_SCHEDULE = "11:00 AM–12:00 PM and 1:00 PM–4:00 PM";

const longDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const currentMonth = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
};

export default function Availability() {
  const [slots, setSlots] = useState<StaffAvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scheduleMonth, setScheduleMonth] = useState(currentMonth());
  const [viewMonth, setViewMonth] = useState(currentMonth());
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const load = useCallback((month: string) => {
    setLoading(true);

    return getStaffAvailability(month)
      .then(setSlots)
      .catch(() => toast.error("Unable to load availability."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load(viewMonth);
  }, [load, viewMonth]);

  const grouped = useMemo(
    () =>
      Object.entries(
        slots.reduce<Record<string, StaffAvailabilitySlot[]>>((days, slot) => {
          (days[slot.date] ??= []).push(slot);
          return days;
        }, {}),
      ),
    [slots],
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!scheduleMonth) {
      setErrors({
        month: ["Select a month before opening the schedule."],
      });

      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const result = await createStaffAvailability(scheduleMonth);

      if (result.recordsCreated > 0) {
        toast.success(result.message);
      } else {
        toast.info(result.message);
      }

      if (viewMonth === scheduleMonth) {
        await load(scheduleMonth);
      } else {
        setViewMonth(scheduleMonth);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        setErrors(error.response.data.errors ?? {});
      } else {
        toast.error("Unable to open the monthly schedule.");
      }
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (slot: StaffAvailabilitySlot) => {
    try {
      await updateStaffAvailability(slot.id, !slot.isActive);
      setSlots((items) =>
        items.map((item) =>
          item.id === slot.id ? { ...item, isActive: !slot.isActive } : item,
        ),
      );
      toast.success(`Time slot ${slot.isActive ? "disabled" : "enabled"}.`);
    } catch {
      toast.error("Unable to update this time slot.");
    }
  };

  const remove = async (slot: StaffAvailabilitySlot) => {
    try {
      await deleteStaffAvailability(slot.id);
      setSlots((items) => items.filter((item) => item.id !== slot.id));
      toast.success("Shared availability removed.");
    } catch {
      toast.error(
        "Time slots with bookings cannot be deleted. Disable the slot instead.",
      );
    }
  };

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <header className="overflow-hidden rounded-3xl bg-linear-to-br from-[#B22222] to-[#741515] px-7 py-9 text-white shadow-lg sm:px-10">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/15 p-3">
              <CalendarClock size={28} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#F5D76E]">
                Schedule control
              </p>
              <h1 className="mt-1 font-serif text-3xl font-bold">
                Booking Availability
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/75">
                Open shared parish schedules using the fixed weekday and Sunday
                hours.
              </p>
            </div>
          </div>
        </header>

        <div className="grid items-start gap-6 xl:grid-cols-[390px_1fr]">
          <form
            onSubmit={submit}
            noValidate
            className="space-y-5 rounded-3xl border border-[#E7E2DA] bg-white p-6 shadow-sm xl:sticky xl:top-6"
          >
            <div className="flex items-center gap-3">
              <CalendarPlus className="text-[#B22222]" />
              <div>
                <h2 className="font-serif text-xl font-bold">
                  Open Monthly Schedule
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Generate the fixed booking hours for an entire month.
                </p>
              </div>
            </div>

            <label className="block text-sm font-medium">
              Schedule month
              <input
                type="month"
                min={currentMonth()}
                value={scheduleMonth}
                onChange={(event) => {
                  setScheduleMonth(event.target.value);
                  setErrors((current) => {
                    const next = { ...current };
                    delete next.month;
                    return next;
                  });
                }}
                aria-invalid={Boolean(errors.month)}
                className={`mt-2 w-full rounded-xl border px-4 py-3 outline-none transition focus:border-[#B22222] ${errors.month ? "border-red-400 bg-red-50/30" : "border-gray-300"}`}
              />
              {errors.month?.[0] && (
                <p className="mt-1.5 text-xs text-red-600">{errors.month[0]}</p>
              )}
            </label>

            <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-900">
              <div>
                <p className="font-semibold">Monday–Saturday</p>
                <p>{WEEKDAY_SCHEDULE}</p>
              </div>
              <div>
                <p className="font-semibold">Sunday</p>
                <p>{SUNDAY_SCHEDULE}</p>
              </div>
              <p className="border-t border-blue-200 pt-3 text-blue-800">
                Existing schedules are kept unchanged. Every newly opened time
                starts free for Baptism, Wedding, and Funeral; its first booking
                determines the service lock.
              </p>
            </div>

            <button
              disabled={saving}
              className="w-full rounded-xl bg-[#B22222] py-3 font-semibold text-white transition hover:bg-[#8F1B1B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Opening monthly schedule..." : "Open Monthly Schedule"}
            </button>
          </form>

          <section className="overflow-hidden rounded-3xl border border-[#E7E2DA] bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold">
                  Monthly Shared Slots
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  A free time is available to all three services until its first
                  booking.
                </p>
              </div>
              <label className="block shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Filter size={13} /> View month
                </span>
                <input
                  type="month"
                  min={currentMonth()}
                  value={viewMonth}
                  onChange={(event) => setViewMonth(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium normal-case tracking-normal text-gray-800 outline-none transition focus:border-[#B22222] sm:w-44"
                />
              </label>
            </div>
            <div className="max-h-[65vh] min-h-64 overflow-y-auto overscroll-contain scroll-smooth px-6 py-5 pr-4 [scrollbar-color:#D6CEC4_transparent] scrollbar-thin">
              {loading ? (
                <p className="py-12 text-center text-gray-400">
                  Loading availability...
                </p>
              ) : grouped.length === 0 ? (
                <p className="rounded-2xl border border-dashed py-12 text-center text-gray-400">
                  No availability configured for this month.
                </p>
              ) : (
                <div className="space-y-6">
                  {grouped.map(([date, daySlots]) => (
                    <div key={date}>
                      <div className="top-0 z-10 mb-3 flex items-center justify-between border-b border-red-100 bg-white/95 py-2 backdrop-blur-sm">
                        <h3 className="text-sm font-bold text-[#B22222]">
                          {longDate(date)}
                        </h3>
                        <span className="text-xs font-medium text-gray-400">
                          {daySlots.length} slots
                        </span>
                      </div>
                      <div className="grid gap-3 lg:grid-cols-2">
                        {daySlots.map((slot) => (
                          <article
                            key={slot.id}
                            className={`rounded-2xl border p-4 ${slot.isActive ? "border-gray-200" : "border-gray-200 bg-gray-50 opacity-65"}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900">
                                  {slot.startTime}–{slot.endTime}
                                </p>
                                {slot.lockedByService ? (
                                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                                    Reserved for {slot.lockedByService} ·{" "}
                                    {slot.booked} booked
                                  </p>
                                ) : (
                                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                                    <CheckCircle2 size={13} /> Free for all
                                    services
                                  </p>
                                )}
                              </div>
                              <div className="flex shrink-0 gap-1">
                                <button
                                  type="button"
                                  title={
                                    slot.isActive
                                      ? "Disable for all services"
                                      : "Enable for all services"
                                  }
                                  onClick={() => void toggle(slot)}
                                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                                >
                                  <Power size={17} />
                                </button>
                                <button
                                  type="button"
                                  title="Delete for all services"
                                  onClick={() => void remove(slot)}
                                  className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 size={17} />
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
