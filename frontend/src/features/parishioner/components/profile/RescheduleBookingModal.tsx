import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { CalendarClock, Check, LoaderCircle, X } from "lucide-react";
import { toast } from "sonner";

import BookingCalendar from "../booking/BookingCalendar";
import {
  formatBookingDate,
  getBookingSlots,
  type BookingSlot,
} from "@/services/bookingSlotService";
import {
  rescheduleParishionerBooking,
  type ParishionerBookingDetail,
  type RescheduledBooking,
} from "@/services/parishionerBookingService";

interface Props {
  booking: ParishionerBookingDetail;
  onClose: () => void;
  onRescheduled: (booking: RescheduledBooking) => void;
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

export default function RescheduleBookingModal({
  booking,
  onClose,
  onRescheduled,
}: Props) {
  const initialDate = booking.schedule.date
    ? new Date(`${booking.schedule.date}T00:00:00`)
    : new Date();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [slotResult, setSlotResult] = useState<{
    key: string;
    slots: BookingSlot[];
    error: string;
  }>({ key: "", slots: [], error: "" });
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const selectedDateKey = formatBookingDate(selectedDate);
  const slotRequestKey = `${booking.serviceCode}:${selectedDateKey}`;
  const loadingSlots = slotResult.key !== slotRequestKey;
  const slots = loadingSlots ? [] : slotResult.slots;
  const slotLoadError = loadingSlots ? "" : slotResult.error;

  useEffect(() => {
    let active = true;

    getBookingSlots(booking.serviceCode, selectedDateKey)
      .then((result) => {
        if (active) {
          setSlotResult({ key: slotRequestKey, slots: result, error: "" });
        }
      })
      .catch(() => {
        if (active) {
          setSlotResult({
            key: slotRequestKey,
            slots: [],
            error: "Unable to load the available time slots.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [booking.serviceCode, selectedDateKey, slotRequestKey]);

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlotId(null);
    setError("");
  };

  const submit = async () => {
    if (!selectedSlotId) {
      setError("Please select an available time slot.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await rescheduleParishionerBooking(
        booking.id,
        selectedSlotId,
      );
      toast.success(response.message);
      onRescheduled(response.data);
      onClose();
    } catch (requestError) {
      if (requestError instanceof AxiosError && requestError.response?.status === 422) {
        setError(
          requestError.response.data.errors?.booking_slot_id?.[0] ??
            "The selected schedule is unavailable.",
        );
      } else {
        setError("Unable to reschedule this booking. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      data-app-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        event.stopPropagation();
        if (!saving) onClose();
      }}
    >
      <section
        data-modal-scroll="true"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reschedule-title"
        className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[#FAF8F5] shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#B22222]">{booking.reference}</p>
            <h2 id="reschedule-title" className="mt-1 font-serif text-2xl font-bold text-[#292524]">Reschedule {booking.service}</h2>
            <p className="mt-1 text-sm text-gray-500">Choose another available date and time. The new schedule will return to staff review.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close" className="ml-4 grid size-10 shrink-0 place-items-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50"><X size={20} /></button>
        </header>

        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
          <BookingCalendar
            service={booking.serviceCode}
            selectedDate={selectedDate}
            onDateSelect={selectDate}
          />

          <div className="rounded-3xl bg-white p-5 shadow-lg">
            <div className="flex items-start gap-3 border-b border-gray-100 pb-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-50 text-[#B22222]"><CalendarClock size={20} /></div>
              <div>
                <h3 className="font-serif text-lg font-bold">Available Times</h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">{selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
            </div>

            <div data-modal-scroll="true" className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
              {loadingSlots ? (
                <div className="flex items-center justify-center py-12 text-sm text-gray-500"><LoaderCircle size={18} className="mr-2 animate-spin" /> Loading slots...</div>
              ) : slots.length === 0 ? (
                <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-gray-500">No time slots are available on this date.</p>
              ) : (
                slots.map((slot) => {
                  const isCurrent = slot.id === booking.bookingSlotId;
                  const disabled = !slot.available || isCurrent;
                  const selected = slot.id === selectedSlotId;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        setSelectedSlotId(slot.id);
                        setError("");
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                        selected
                          ? "border-[#B22222] bg-red-50 text-[#B22222]"
                          : disabled
                            ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400"
                            : "border-gray-200 hover:border-[#B22222]"
                      }`}
                    >
                      <span className="font-semibold">{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</span>
                      {selected ? <Check size={18} /> : <span className="text-xs">{isCurrent ? "Current" : slot.available ? "Available" : slot.availability_status === "locked" ? `Reserved for ${slot.locked_by_service ?? "another service"}` : "Full"}</span>}
                    </button>
                  );
                })
              )}
            </div>

            {(error || slotLoadError) && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error || slotLoadError}</p>}

            <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">
              <button type="button" onClick={submit} disabled={!selectedSlotId || saving} className="w-full rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white transition hover:bg-[#991B1B] disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Rescheduling..." : "Confirm New Schedule"}</button>
              <button type="button" onClick={onClose} disabled={saving} className="w-full rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
