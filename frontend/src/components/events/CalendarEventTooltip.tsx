import { Clock3, MapPin } from "lucide-react";

import type { ParishEvent } from "@/services/eventService";
import { eventTime } from "@/utils/eventCalendar";

export default function CalendarEventTooltip({
  events,
  alignment = "center",
}: {
  events: ParishEvent[];
  alignment?: "left" | "center" | "right";
}) {
  if (events.length === 0) return null;

  const position =
    alignment === "left"
      ? "left-0"
      : alignment === "right"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";

  return (
    <div
      role="tooltip"
      className={`pointer-events-none absolute bottom-full z-40 mb-2 hidden w-60 rounded-xl bg-[#292524] p-3 text-left text-white shadow-xl group-hover:block group-focus-visible:block ${position}`}
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#F5D76E]">
        Parish {events.length === 1 ? "Event" : "Events"}
      </p>
      <div className="space-y-2.5">
        {events.slice(0, 3).map((event) => (
          <div key={event.id}>
            <p className="text-xs font-semibold leading-4">{event.title}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-white/75">
              <Clock3 size={11} className="shrink-0" /> {eventTime(event)}
            </p>
            {event.location && (
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/65">
                <MapPin size={11} className="shrink-0" />
                <span className="truncate">{event.location}</span>
              </p>
            )}
          </div>
        ))}
      </div>
      {events.length > 3 && (
        <p className="mt-2 border-t border-white/10 pt-2 text-[10px] text-white/60">
          +{events.length - 3} more event{events.length - 3 === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}
