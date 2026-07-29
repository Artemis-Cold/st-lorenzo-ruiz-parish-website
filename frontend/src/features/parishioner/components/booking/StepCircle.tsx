interface StepCircleProps {
  number: number;
  label: string;
  active?: boolean;
  completed?: boolean;
}

export default function StepCircle({
  number,
  label,
  active,
  completed,
}: StepCircleProps) {
  return (
    <div className="flex items-center">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-all

        ${
          active
            ? "bg-[#B22222] text-white"
            : completed
              ? "bg-green-600 text-white"
              : "bg-gray-300 text-gray-600"
        }
        `}
      >
        {number}
      </div>

      <span
        className={`ml-3 text-sm font-medium

        ${active ? "text-[#B22222]" : "text-gray-500"}
        `}
      >
        {label}
      </span>
    </div>
  );
}
