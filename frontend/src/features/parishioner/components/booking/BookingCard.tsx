import type { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function BookingCard({
  title,
  children,
  className = "",
  contentClassName = "p-8",
}: Props) {
  return (
    <div className={`overflow-hidden rounded-2xl bg-white shadow-lg ${className}`}>
      <div className="shrink-0 bg-[#B22222] px-5 py-4 sm:px-6">
        <h2 className="font-serif text-xl font-bold uppercase text-white sm:text-2xl">
          {title}
        </h2>
      </div>

      <div className={contentClassName}>{children}</div>
    </div>
  );
}
