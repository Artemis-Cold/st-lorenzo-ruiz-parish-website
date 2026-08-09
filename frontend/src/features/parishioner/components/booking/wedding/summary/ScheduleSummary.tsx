import { CalendarDays, Clock3, Church } from "lucide-react";

import { BookingCard } from "../..";
import type { BookingSlot } from "../../../../../../services/bookingSlotService";

interface Props {
  selectedDate: Date | null;
  selectedSlot: BookingSlot | null;
}

export default function ScheduleSummary({ selectedDate, selectedSlot }: Props) {
  return (
    <BookingCard title="Selected Schedule">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-5">
          <CalendarDays className="mb-3 text-[#B22222]" />
          <p className="text-sm text-gray-500">Date</p>
          <p className="font-semibold">
            {selectedDate?.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }) ?? "-"}
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <Clock3 className="mb-3 text-[#B22222]" />
          <p className="text-sm text-gray-500">Time</p>
          <p className="font-semibold">
            {selectedSlot
              ? selectedSlot.start_time + " - " + selectedSlot.end_time
              : "-"}
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <Church className="mb-3 text-[#B22222]" />
          <p className="text-sm text-gray-500">Service</p>
          <p className="font-semibold">Wedding</p>
        </div>
      </div>
    </BookingCard>
  );
}
