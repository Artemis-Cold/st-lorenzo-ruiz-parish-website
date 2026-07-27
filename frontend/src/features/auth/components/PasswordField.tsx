import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

interface PasswordFieldProps {
  label: string;
  placeholder: string;
}

export default function PasswordField({
  label,
  placeholder,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="flex items-center rounded-xl border border-gray-300 px-4 transition focus-within:border-[#B22222] focus-within:ring-2 focus-within:ring-[#B22222]/20">
        <Lock size={18} className="mr-3 text-gray-400" />

        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="w-full py-3 outline-none"
        />

        <button type="button" onClick={() => setShow(!show)}>
          {show ? (
            <EyeOff size={18} className="text-gray-400" />
          ) : (
            <Eye size={18} className="text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
}
