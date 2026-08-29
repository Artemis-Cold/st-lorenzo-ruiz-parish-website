import { MapPin } from "lucide-react";

import type { NavigationDestination } from "../types/navigation";

interface DestinationSelectorProps {
  destinations: NavigationDestination[];
  value: string;
  disabled?: boolean;
  onChange: (destinationId: string) => void;
}

export default function DestinationSelector({
  destinations,
  value,
  disabled = false,
  onChange,
}: DestinationSelectorProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-700">
        <MapPin size={17} className="text-[#B22222]" />
        Destination
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-800 outline-none transition focus:border-[#B22222] focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-stone-100"
      >
        {destinations.map((destination) => (
          <option key={destination.id} value={destination.id}>
            {destination.name}
          </option>
        ))}
      </select>
    </label>
  );
}
