import type { ParishEvent } from "@/services/eventService";

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function eventsByDate(events: ParishEvent[]) {
  return events.reduce<Record<string, ParishEvent[]>>((result, event) => {
    const start = new Date(event.startsAt);
    const end = event.endsAt ? new Date(event.endsAt) : start;
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const finalDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    while (cursor <= finalDay) {
      (result[dateKey(cursor)] ??= []).push(event);
      cursor.setDate(cursor.getDate() + 1);
    }

    return result;
  }, {});
}

const time = (value: string) =>
  new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

export function eventTime(event: ParishEvent): string {
  return event.endsAt
    ? `${time(event.startsAt)} – ${time(event.endsAt)}`
    : time(event.startsAt);
}
