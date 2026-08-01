import { useState } from "react";

import BookingCalendar from "../../BookingCalendar";
import TimeSlotPanel from "../../TimeSlotPanel";
export default function ScheduleStep() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <BookingCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </div>

      <TimeSlotPanel selectedDate={selectedDate} />
    </div>
  );
}
