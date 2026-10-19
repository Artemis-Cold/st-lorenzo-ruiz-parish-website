import { useEffect, useState } from "react";
import BookingCalendar from "./BookingCalendar";
import BookingCard from "./BookingCard";
import TimeSlotCard from "./TimeSlotCard";
import {
  formatBookingDate,
  getBookingSlots,
  type BookingSlot,
} from "@/services/bookingSlotService";

export default function RequestedSchedule({
  service,
  date,
  slot,
  onDateChange,
  onSlotChange,
}: {
  service: string;
  date: Date | null;
  slot: BookingSlot | null;
  onDateChange: (date: Date) => void;
  onSlotChange: (slot: BookingSlot | null) => void;
}) {
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!date) return;
    let active = true;
    getBookingSlots(service, formatBookingDate(date))
      .then((items) => {
        if (active) {
          setSlots(items);
          setError("");
        }
      })
      .catch(() => {
        if (active)
          setError(
            "Unable to load time slots. Select the date again to retry.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [service, date]);
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Your requested schedule is subject to admin confirmation. Upload
        requirements in My Profile after receiving the confirmation SMS.
      </p>
      <div className="grid gap-6 lg:h-[31rem] lg:grid-cols-3 lg:items-stretch">
        <div className="min-h-0 lg:col-span-2">
          <BookingCalendar
            service={service}
            selectedDate={date ?? new Date()}
            onDateSelect={(next) => {
              setLoading(true);
              setSlots([]);
              setError("");
              onSlotChange(null);
              onDateChange(new Date(next));
            }}
          />
        </div>
        <BookingCard
          title="Available Time Slots"
          className="flex h-[31rem] min-h-0 flex-col lg:h-full"
          contentClassName="min-h-0 flex-1 overflow-hidden p-4 sm:p-5"
        >
          <div
            role="region"
            aria-label="Available time slots / Mga available na oras"
            tabIndex={0}
            className="h-full overflow-y-auto overscroll-contain pr-2 [scrollbar-color:#D6CEC4_transparent] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:outline-[#B22222]"
          >
            {loading ? (
              <p>Loading times…</p>
            ) : error ? (
              <p role="alert">{error}</p>
            ) : (
              <div className="space-y-3">
                {!slots.length && (
                  <p className="text-sm text-gray-500">
                    Select an available date to view times.
                  </p>
                )}
                {slots.map((item) => (
                  <TimeSlotCard
                    key={item.id}
                    slot={item}
                    selected={slot?.id === item.id}
                    onSelect={() => onSlotChange(item)}
                  />
                ))}
              </div>
            )}
          </div>
        </BookingCard>
      </div>
    </div>
  );
}
