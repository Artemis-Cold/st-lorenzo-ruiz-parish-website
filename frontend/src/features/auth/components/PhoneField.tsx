import { Phone } from "lucide-react";

export default function PhoneField() {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Mobile Number
      </label>

      <div className="flex items-center rounded-xl border border-gray-300 px-4 transition focus-within:border-[#B22222] focus-within:ring-2 focus-within:ring-[#B22222]/20">
        <Phone size={18} className="mr-3 text-gray-400" />

        <input
          type="tel"
          placeholder="09XX XXX XXXX"
          className="w-full py-3 outline-none"
        />
      </div>
    </div>
  );
}
