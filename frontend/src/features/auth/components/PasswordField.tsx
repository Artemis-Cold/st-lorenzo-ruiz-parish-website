import { Eye, EyeOff, Lock } from "lucide-react";
import { useState, type ChangeEvent } from "react";

interface PasswordFieldProps {
  label: string;
  placeholder: string;

  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;

  disabled?: boolean;
}

export default function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
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
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full py-3 outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          disabled={disabled}
          className="text-gray-400"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}