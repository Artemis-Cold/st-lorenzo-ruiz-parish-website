import { timeSlots } from "./timeSlots";
import type { CalendarBooking } from "../types/booking";

export const calendarBookings: CalendarBooking[] = Object.values(
  timeSlots.reduce<Record<string, CalendarBooking>>((acc, slot) => {
    const existing = acc[slot.date];

    if (!existing) {
      acc[slot.date] = {
        date: slot.date,
        status: slot.status,
      };
      return acc;
    }

    if (slot.status === "full") {
      existing.status = "full";
    } else if (slot.status === "limited" && existing.status === "available") {
      existing.status = "limited";
    }

    return acc;
  }, {}),
);
