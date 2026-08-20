import { CalendarDays } from "lucide-react";
import TimeSlotCard from "../../TimeSlotCard";
import type { Dispatch, SetStateAction } from "react";
import type { FuneralBooking } from "../../../../types/funeral";
import type { BookingSlot } from "../../../../../../services/bookingSlotService";

interface Props {
  booking: FuneralBooking;
  setBooking: Dispatch<SetStateAction<FuneralBooking>>;
  slots: BookingSlot[];
  loading: boolean;
  selectedDate: Date | null;
  setSelectedSlot: Dispatch<SetStateAction<BookingSlot | null>>;
}

export default function TimeSlotPanel(props: Props) {
  if (props.loading) {
    return (
      <div className="h-full rounded-3xl border bg-white py-10 text-center shadow-lg">
        Loading slots...
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-3xl bg-white p-6 shadow-lg">
      <div className="mb-6 flex shrink-0 items-center gap-3">
        <CalendarDays className="text-[#B22222]" />
        <div>
          <h2 className="font-serif text-xl font-bold">Available Time Slots</h2>
          <p className="text-sm text-gray-500">
            {props.selectedDate?.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            }) ?? "Select a date"}
          </p>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2 [scrollbar-color:#D6CEC4_transparent] [scrollbar-width:thin]">
        {props.slots.length === 0 ? (
          <div className="rounded-2xl border border-dashed py-10 text-center text-gray-500">
            No schedules available.
          </div>
        ) : (
          props.slots.map((slot) => (
            <TimeSlotCard
              key={slot.id}
              slot={slot}
              label="Schedule"
              selected={props.booking.booking_slot_id === slot.id}
              onSelect={() => {
                props.setBooking((previous) => ({
                  ...previous,
                  booking_slot_id: slot.id,
                }));
                props.setSelectedSlot(slot);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
