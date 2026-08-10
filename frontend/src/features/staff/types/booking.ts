export type BookingStatus = "pending" | "paid" | "cancelled" | "completed";

export type BookingType = "Marriage" | "Funeral" | "Baptism";

export interface Booking {
  id: number;
  date: string; // mm-dd-yyyy for display
  names: string;
  contactNumber: string;
  type: BookingType;
  amount: number;
  status: BookingStatus;
}