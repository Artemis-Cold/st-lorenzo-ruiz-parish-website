interface AuthButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
}

export default function AuthButton({
  children,
  type = "button",
  disabled = false,
}: AuthButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="w-full rounded-xl bg-[#B22222] py-3 font-semibold text-white transition-all duration-300 hover:bg-[#981B1B] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}
