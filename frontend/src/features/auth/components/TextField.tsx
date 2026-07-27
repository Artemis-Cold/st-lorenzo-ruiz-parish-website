import type { LucideIcon } from "lucide-react";

interface TextFieldProps {
  label: string;
  placeholder: string;
  icon: LucideIcon;
  type?: string;
}

export default function TextField({
  label,
  placeholder,
  icon: Icon,
  type = "text",
}: TextFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="flex items-center rounded-xl border border-gray-300 bg-white px-4 transition focus-within:border-[#B22222] focus-within:ring-2 focus-within:ring-[#B22222]/20">
        <Icon size={18} className="mr-3 text-gray-400" />

        <input
          type={type}
          placeholder={placeholder}
          className="w-full bg-transparent py-3 outline-none"
        />
      </div>
    </div>
  );
}
