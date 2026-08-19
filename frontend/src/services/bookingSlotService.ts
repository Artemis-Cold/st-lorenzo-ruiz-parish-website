import api from "../api/axios";

export interface BookingSlot {
  id: number;
  start_time: string;
  end_time: string;
  capacity: number | null;
  booked: number;
  available: boolean;
  availability_status: "available" | "full" | "locked" | "inactive" | "past";
  locked_by_service: string | null;
}

export interface BookingAvailability {
  date: string;
  capacity: number;
  booked: number;
  remaining: number;
  status: "available" | "limited" | "full";
}

export const formatBookingDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

export async function getBookingSlots(
  service: string,
  date: string
): Promise<BookingSlot[]> {
  const { data } = await api.get("/booking-slots", {
    params: {
      service,
      date,
    },
  });

  return data;
}

export async function getBookingAvailability(
  service: string,
  month: string,
): Promise<BookingAvailability[]> {
  const { data } = await api.get<BookingAvailability[]>("/booking-slots", {
    params: { service, month },
  });

  return data;
}
