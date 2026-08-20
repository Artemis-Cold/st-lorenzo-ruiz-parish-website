import { useEffect, useState } from "react";
import BookingCalendar from "../../BookingCalendar";
import TimeSlotPanel from "../summary/TimeSlotPanel";
import type { Dispatch, SetStateAction } from "react";
import type { WeddingBooking } from "../../../../types/wedding";
import {
  getBookingSlots,
  formatBookingDate,
  type BookingSlot,
} from "../../../../../../services/bookingSlotService";

interface ScheduleStepProps {
  booking: WeddingBooking;
  setBooking: Dispatch<SetStateAction<WeddingBooking>>;
  selectedDate: Date | null;
  setSelectedDate: Dispatch<SetStateAction<Date | null>>;
  selectedSlot: BookingSlot | null;
  setSelectedSlot: Dispatch<SetStateAction<BookingSlot | null>>;
}

export default function ScheduleStep({
  booking,
  setBooking,
  selectedDate,
  setSelectedDate,
  selectedSlot,
  setSelectedSlot,
}: ScheduleStepProps) {
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);

    setBooking((prev) => ({
      ...prev,
      booking_slot_id: 0,
    }));

    setSelectedSlot(null);
  };

  useEffect(() => {
    if (!selectedDate) return;

    const loadSlots = async () => {
      try {
        setLoadingSlots(true);

        const formattedDate = formatBookingDate(selectedDate);

        const slots = await getBookingSlots("wedding", formattedDate);

        setAvailableSlots(slots);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [selectedDate]);


  useEffect(() => {
    if (selectedSlot || booking.booking_slot_id === 0) return;

    const match = availableSlots.find((s) => s.id === booking.booking_slot_id);

    if (match) {
      setSelectedSlot(match);
    }
  }, [availableSlots, booking.booking_slot_id, selectedSlot, setSelectedSlot]);

  return (
    <div className="grid gap-6 lg:h-[31rem] lg:grid-cols-3 lg:items-stretch">
      <div className="min-h-0 lg:col-span-2">
        <BookingCalendar
          service="wedding"
          selectedDate={selectedDate ?? new Date()}
          onDateSelect={handleDateSelect}
        />
      </div>

      <TimeSlotPanel
        booking={booking}
        setBooking={setBooking}
        slots={availableSlots}
        loading={loadingSlots}
        selectedDate={selectedDate}
        setSelectedSlot={setSelectedSlot}
      />
    </div>
  );
}
