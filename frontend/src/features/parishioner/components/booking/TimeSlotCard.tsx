import type { BookingSlot } from "../../../../services/bookingSlotService";

interface TimeSlotCardProps {
  slot: BookingSlot;
  selected: boolean;
  onSelect: () => void;
  label?: string;
}

export default function TimeSlotCard({
  slot,
  selected,
  onSelect,
  label = "Schedule",
}: TimeSlotCardProps) {
  return (
    <button
      disabled={!slot.available}
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition-all duration-200

      ${
        selected
          ? "border-[#B22222] ring-2 ring-[#B22222]/20"
          : "border-gray-200"
      }

      ${
        !slot.available
          ? "cursor-not-allowed opacity-60"
          : "hover:-translate-y-1 hover:shadow-md"
      }
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {slot.start_time} - {slot.end_time}
          </h3>

          <p className="text-sm text-gray-500">{label}</p>
        </div>

        <span
          className={`mt-1 h-3 w-3 rounded-full ${
            slot.available ? "bg-green-500" : "bg-[#B22222]"
          }`}
        />
      </div>

      <div className="mt-3 text-sm">
        {slot.available ? (
          <span className="text-green-600">Available</span>
        ) : (
          <span className="text-[#B22222]">Fully Booked</span>
        )}
      </div>
    </button>
  );
}
