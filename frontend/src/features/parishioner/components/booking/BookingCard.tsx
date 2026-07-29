import type { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export default function BookingCard({ title, children }: Props) {
  return (
    <div className="rounded-2xl bg-white shadow-lg">
      <div className="rounded-t-2xl bg-[#B22222] px-6 py-4">
        <h2 className="font-serif text-2xl font-bold uppercase text-white">
          {title}
        </h2>
      </div>

      <div className="p-8">{children}</div>
    </div>
  );
}
