import BookingCalendar from "../../BookingCalendar";
import IntentionSelector from "../summary/IntentionSelector";

import type { Dispatch, SetStateAction } from "react";
import type { MassIntentionBooking } from "../../../../types/mass";

interface ScheduleStepProps {
  booking: MassIntentionBooking;
  setBooking: Dispatch<SetStateAction<MassIntentionBooking>>;
}

export default function ScheduleStep({
  booking,
  setBooking,
}: ScheduleStepProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <BookingCalendar
        selectedDate={booking.date ?? new Date()}
        onDateSelect={(date) =>
          setBooking((prev) => ({
            ...prev,
            date,
          }))
        }
      />

      <IntentionSelector
        booking={booking}
        setBooking={setBooking}
      />
    </div>
  );
}