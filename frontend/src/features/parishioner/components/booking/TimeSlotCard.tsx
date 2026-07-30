import type { TimeSlot } from "../../data/timeSlots";

interface TimeSlotCardProps {
  slot: TimeSlot;
  selected: boolean;
  onSelect: () => void;
}

export default function TimeSlotCard({
  slot,
  selected,
  onSelect,
}: TimeSlotCardProps) {
  const colors = {
    available: "bg-green-500",
    limited: "bg-yellow-400",
    full: "bg-[#B22222]",
  };

  return (
    <button
      disabled={slot.status === "full"}
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition-all duration-200

      ${
        selected
          ? "border-[#B22222] ring-2 ring-[#B22222]/20"
          : "border-gray-200"
      }

      ${
        slot.status === "full"
          ? "cursor-not-allowed opacity-60"
          : "hover:-translate-y-1 hover:shadow-md"
      }
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{slot.time}</h3>

          <p className="text-sm text-gray-500">{slot.service}</p>
        </div>

        <span className={`mt-1 h-3 w-3 rounded-full ${colors[slot.status]}`} />
      </div>

      <div className="mt-3 text-sm">
        {slot.status === "available" && (
          <span className="text-green-600">
            {slot.remainingSlots} slots available
          </span>
        )}

        {slot.status === "limited" && (
          <span className="text-yellow-600">
            Only {slot.remainingSlots} slots left
          </span>
        )}

        {slot.status === "full" && (
          <span className="text-[#B22222]">Fully Booked</span>
        )}
      </div>
    </button>
  );
}
