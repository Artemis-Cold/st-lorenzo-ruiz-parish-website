import { CalendarDays, Clock, MapPin } from "lucide-react";

const events = [
  {
    date: "31",
    month: "MAY",
    title: "Flores de Mayo",
    time: "6:00 PM",
    venue: "Parish Grounds",
  },
  {
    date: "15",
    month: "JUN",
    title: "Youth Fellowship",
    time: "2:00 PM",
    venue: "Parish Hall",
  },
  {
    date: "22",
    month: "JUN",
    title: "Baptism Seminar",
    time: "8:30 AM",
    venue: "Conference Room",
  },
];

export default function EventsCard() {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <div className="mb-8 flex items-center gap-3">
        <CalendarDays className="text-[#B22222]" />

        <h2 className="font-serif text-2xl font-bold">
          Upcoming Parish Events
        </h2>
      </div>

      <div className="space-y-5">
        {events.map((event) => (
          <div
            key={event.title}
            className="flex gap-5 rounded-2xl border border-gray-100 p-5 transition hover:shadow-md"
          >
            <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#B22222] text-white">
              <span className="text-2xl font-bold">{event.date}</span>

              <span className="text-xs tracking-widest">{event.month}</span>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold">{event.title}</h3>

              <div className="mt-3 flex flex-wrap gap-5 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <Clock size={16} />
                  {event.time}
                </span>

                <span className="flex items-center gap-2">
                  <MapPin size={16} />
                  {event.venue}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
