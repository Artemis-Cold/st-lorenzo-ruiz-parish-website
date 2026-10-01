import { Check, Circle } from "lucide-react";

export default function PasswordRequirements({
  password,
  id,
}: {
  password: string;
  id: string;
}) {
  const requirements = [
    { label: "At least 8 characters", met: Array.from(password).length >= 8 },
    { label: "At least 1 uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least 1 lowercase letter", met: /[a-z]/.test(password) },
    { label: "At least 1 number", met: /[0-9]/.test(password) },
  ];
  return (
    <div id={id} className="mt-3 text-sm text-gray-600">
      <p className="font-medium">Password must contain:</p>
      <ul className="mt-2 space-y-1">
        {requirements.map(({ label, met }) => (
          <li
            key={label}
            className={`flex items-center gap-2 ${met ? "text-emerald-700" : ""}`}
          >
            {met ? (
              <Check size={15} aria-hidden />
            ) : (
              <Circle size={15} aria-hidden />
            )}
            <span className="sr-only">{met ? "Met: " : "Not met: "}</span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
