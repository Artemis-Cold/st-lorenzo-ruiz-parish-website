import BookingCalendar from "../../BookingCalendar";
import TimeSlotPanel from "../../baptism/summary/TimeSlotPanel";
import type { Dispatch, SetStateAction } from "react";
import type { BaptismBooking } from "../../../../types/baptism";

interface ScheduleStepProps {
  booking: BaptismBooking;
  setBooking: Dispatch<SetStateAction<BaptismBooking>>;
}

export default function ScheduleStep({
  booking,
  setBooking,
}: ScheduleStepProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <BookingCalendar
          selectedDate={booking.date ?? new Date()}
          onDateSelect={(date) =>
            setBooking((prev) => ({
              ...prev,
              date,
              timeSlot: null,
            }))
          }
        />
      </div>

      <TimeSlotPanel booking={booking} setBooking={setBooking} />
    </div>
  );
}
