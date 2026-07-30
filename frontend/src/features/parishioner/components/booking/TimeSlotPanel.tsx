import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";

import { timeSlots } from "../../data/timeSlots";
import TimeSlotCard from "./TimeSlotCard";

interface Props {
  selectedDate: Date;
}

export default function TimeSlotPanel({ selectedDate }: Props) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const key = `${selectedDate.getFullYear()}-${String(
    selectedDate.getMonth() + 1,
  ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  const slots = useMemo(
    () => timeSlots.filter((slot) => slot.date === key),
    [key],
  );

  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center gap-3">
        <CalendarDays className="text-[#B22222]" />

        <div>
          <h2 className="font-serif text-xl font-bold">Available Time Slots</h2>

          <p className="text-sm text-gray-500">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
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
              selected={selectedSlot === slot.id}
              onSelect={() => setSelectedSlot(slot.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
