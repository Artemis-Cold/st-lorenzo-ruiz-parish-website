import BookingCalendar from "../../BookingCalendar";
import IntentionSelector from "../summary/IntentionSelector";

import type { Dispatch, SetStateAction } from "react";
import type { MassIntentionBooking } from "../../../../types/mass";

interface ScheduleStepProps {
  booking: MassIntentionBooking;
  setBooking: Dispatch<SetStateAction<MassIntentionBooking>>;
  errors?: Record<string, string[]>;
}

export default function ScheduleStep({
  booking,
  setBooking,
  errors,
}: ScheduleStepProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div>
        <BookingCalendar
          selectedDate={booking.intention_date ?? new Date()}
          onDateSelect={(date) =>
            setBooking((prev) => ({
              ...prev,
              intention_date: date,
            }))
          }
        />
        {errors?.intention_date?.[0] && (
          <p className="mt-2 text-sm text-red-600">
            {errors.intention_date[0]}
          </p>
        )}
      </div>

      <IntentionSelector
        booking={booking}
        setBooking={setBooking}
        errors={errors}
      />
    </div>
  );
}
