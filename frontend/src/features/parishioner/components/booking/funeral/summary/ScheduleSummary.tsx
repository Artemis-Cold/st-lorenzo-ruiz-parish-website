import { CalendarDays, Clock3, Church } from "lucide-react";

import { BookingCard } from "../..";
import type { FuneralBooking } from "../../../../types/funeral";

interface Props {
  booking: FuneralBooking;
}

export default function ScheduleSummary({ booking }: Props) {
  return (
    <BookingCard title="Selected Schedule">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-5">
          <CalendarDays className="mb-3 text-[#B22222]" />
          <p className="text-sm text-gray-500">Date</p>
          <p className="font-semibold">
            {booking.date?.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }) ?? "-"}
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <Clock3 className="mb-3 text-[#B22222]" />
          <p className="text-sm text-gray-500">Time</p>
          <p className="font-semibold">{booking.timeSlot?.time ?? "-"}</p>
        </div>

        <div className="rounded-xl border p-5">
          <Church className="mb-3 text-[#B22222]" />
          <p className="text-sm text-gray-500">Service</p>
          <p className="font-semibold">{booking.service}</p>
        </div>
      </div>
    </BookingCard>
  );
}
