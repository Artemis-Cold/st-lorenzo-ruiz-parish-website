export type BookingStatus = "available" | "limited" | "full";

export interface CalendarBooking {
  date: string;
  status: BookingStatus;
}
