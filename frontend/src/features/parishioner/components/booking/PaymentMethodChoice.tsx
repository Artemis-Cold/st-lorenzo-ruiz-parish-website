import { Banknote, Smartphone } from "lucide-react";

export type PaymentMethod = "gcash" | "cash";

export default function PaymentMethodChoice({
  value,
  onChange,
  disabled = false,
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}) {
  const options = [
    {
      value: "gcash" as const,
      title: "GCash",
      description: "Upload your receipt for staff verification.",
      icon: Smartphone,
    },
    {
      value: "cash" as const,
      title: "Cash at Parish Office",
      description: "Pay in person and receive an official receipt.",
      icon: Banknote,
    },
  ];

  return (
    <fieldset disabled={disabled}>
      <legend className="mb-3 text-sm font-semibold text-[#292524]">
        Select payment method
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon;
          const selected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex min-w-0 items-start gap-3 rounded-2xl border p-4 text-left transition ${
                selected
                  ? "border-[#B22222] bg-red-50 ring-2 ring-[#B22222]/10"
                  : "border-gray-200 bg-white hover:border-[#B22222]/40"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                  selected
                    ? "bg-[#B22222] text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <Icon size={19} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[#292524]">
                  {option.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-gray-500">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
