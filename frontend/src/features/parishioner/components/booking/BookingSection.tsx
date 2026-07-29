import type { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export default function BookingSection({ title, children }: Props) {
  return (
    <div className="mb-10">
      <h3 className="mb-5 text-xl font-bold uppercase text-[#B22222]">
        {title}
      </h3>

      {children}
    </div>
  );
}
