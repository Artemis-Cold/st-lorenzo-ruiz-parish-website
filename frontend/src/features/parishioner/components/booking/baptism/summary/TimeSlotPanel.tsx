import { CalendarDays } from "lucide-react";
import TimeSlotCard from "../../TimeSlotCard";

import type { Dispatch, SetStateAction } from "react";
import type { BaptismBooking } from "../../../../types/baptism";

import type { BookingSlot } from "../../../../../../services/bookingSlotService";

interface Props {
  booking: BaptismBooking;
  setBooking: Dispatch<SetStateAction<BaptismBooking>>;

  slots: BookingSlot[];

  loading: boolean;

  selectedDate: Date | null;

  setSelectedSlot: Dispatch<SetStateAction<BookingSlot | null>>;
}

export default function TimeSlotPanel({
  booking,
  setBooking,
  slots,
  loading,
  selectedDate,
  setSelectedSlot,
}: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl border py-10 text-center">
        Loading slots...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-6 w-6 text-primary" />

        <div>
          <h2 className="font-serif text-xl font-bold">Available Time Slots</h2>

          <p className="text-sm text-gray-500">
            {selectedDate
              ? selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "Select a date"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {slots.length === 0 ? (
          <div className="rounded-2xl border border-dashed py-10 text-center text-gray-500">
            No schedules available.
          </div>
        ) : (
          slots.map((slot) => (
            <TimeSlotCard
              key={slot.id}
              slot={slot}
              selected={booking.booking_slot_id === slot.id}
              onSelect={() => {
                setBooking((prev) => ({
                  ...prev,
                  booking_slot_id: slot.id,
                }));

                setSelectedSlot(slot);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}