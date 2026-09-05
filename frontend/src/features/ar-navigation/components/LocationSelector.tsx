import { LocateFixed, MapPin } from "lucide-react";

import type { NavigationLocation } from "../types/navigation";

interface LocationSelectorProps {
  label: string;
  hint: string;
  locations: NavigationLocation[];
  value: string;
  type: "origin" | "destination";
  disabled?: boolean;
  onChange: (locationId: string) => void;
}

export default function LocationSelector({
  label,
  hint,
  locations,
  value,
  type,
  disabled = false,
  onChange,
}: LocationSelectorProps) {
  const Icon = type === "origin" ? LocateFixed : MapPin;

  return (
    <label className="block rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition focus-within:border-red-300 focus-within:ring-4 focus-within:ring-red-50">
      <span className="flex items-center gap-2 text-sm font-bold text-stone-900">
        <span className="grid size-8 place-items-center rounded-lg bg-red-50 text-[#B22222]">
          <Icon size={17} />
        </span>
        {label}
      </span>
      <span className="mt-2 block text-xs leading-5 text-stone-500">
        {hint}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-[#B22222] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>
    </label>
  );
}
