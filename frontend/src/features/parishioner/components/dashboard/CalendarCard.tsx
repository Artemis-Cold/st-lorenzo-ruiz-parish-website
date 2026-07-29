import { Calendar } from "lucide-react";

export default function CalendarCard() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg">
      <div className="mb-5 flex items-center gap-2">
        <Calendar className="text-[#B22222]" />

        <h2 className="font-serif text-xl font-bold">Booking Calendar</h2>
      </div>

      <div className="flex h-72 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 text-gray-400">
        Calendar Component
      </div>
    </div>
  );
}
