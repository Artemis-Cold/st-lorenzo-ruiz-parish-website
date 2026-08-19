import { useEffect, useState } from "react";
import BookingCalendar from "../../BookingCalendar";
import TimeSlotPanel from "../summary/TimeSlotPanel";
import type { Dispatch, SetStateAction } from "react";
import type { FuneralBooking } from "../../../../types/funeral";
import type { BookingSlot } from "../../../../../../services/bookingSlotService";
import {
  formatBookingDate,
  getBookingSlots,
} from "../../../../../../services/bookingSlotService";

interface Props {
  booking: FuneralBooking;
  setBooking: Dispatch<SetStateAction<FuneralBooking>>;
  selectedDate: Date | null;
  setSelectedDate: Dispatch<SetStateAction<Date | null>>;
  selectedSlot: BookingSlot | null;
  setSelectedSlot: Dispatch<SetStateAction<BookingSlot | null>>;
}

export default function ScheduleStep(props: Props) {
  const { booking, setBooking, selectedDate, setSelectedDate, setSelectedSlot } = props;
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;
    getBookingSlots("funeral", formatBookingDate(selectedDate))
      .then(setSlots)
      .finally(() => setLoading(false));
  }, [selectedDate]);

  return (
    <div className="grid gap-6 lg:h-[31rem] lg:grid-cols-3 lg:items-stretch">
      <div className="min-h-0 lg:col-span-2">
        <BookingCalendar
          service="funeral"
          selectedDate={selectedDate ?? new Date()}
          onDateSelect={(date) => {
            setLoading(true);
            setSelectedDate(date);
            setSelectedSlot(null);
            setBooking((previous) => ({
              ...previous,
              booking_slot_id: 0,
            }));
          }}
        />
      </div>
      <TimeSlotPanel
        booking={booking}
        setBooking={setBooking}
        slots={slots}
        loading={loading}
        selectedDate={selectedDate}
        setSelectedSlot={setSelectedSlot}
      />
    </div>
  );
}
