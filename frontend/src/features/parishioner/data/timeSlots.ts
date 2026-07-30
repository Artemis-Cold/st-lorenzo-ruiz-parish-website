import type { BookingStatus } from "../types/booking";

export interface TimeSlot {
  id: number;
  date: string;
  time: string;
  service: string;
  status: BookingStatus;
  remainingSlots: number;
}

export const timeSlots: TimeSlot[] = [
  // August 10
  {
    id: 1,
    date: "2026-08-10",
    time: "8:00 AM",
    service: "Wedding Ceremony",
    status: "available",
    remainingSlots: 5,
  },
  {
    id: 2,
    date: "2026-08-10",
    time: "10:00 AM",
    service: "Wedding Ceremony",
    status: "limited",
    remainingSlots: 2,
  },
  {
    id: 3,
    date: "2026-08-10",
    time: "1:00 PM",
    service: "Wedding Ceremony",
    status: "full",
    remainingSlots: 0,
  },

  // August 11
  {
    id: 4,
    date: "2026-08-11",
    time: "9:00 AM",
    service: "Wedding Ceremony",
    status: "limited",
    remainingSlots: 1,
  },
  {
    id: 5,
    date: "2026-08-11",
    time: "2:00 PM",
    service: "Wedding Ceremony",
    status: "available",
    remainingSlots: 4,
  },

  // August 12
  {
    id: 6,
    date: "2026-08-12",
    time: "8:00 AM",
    service: "Wedding Ceremony",
    status: "full",
    remainingSlots: 0,
  },
  {
    id: 7,
    date: "2026-08-12",
    time: "11:00 AM",
    service: "Wedding Ceremony",
    status: "full",
    remainingSlots: 0,
  },

  // August 15
  {
    id: 8,
    date: "2026-08-15",
    time: "9:00 AM",
    service: "Wedding Ceremony",
    status: "available",
    remainingSlots: 6,
  },

  // August 18
  {
    id: 9,
    date: "2026-08-18",
    time: "10:00 AM",
    service: "Wedding Ceremony",
    status: "limited",
    remainingSlots: 2,
  },
];
