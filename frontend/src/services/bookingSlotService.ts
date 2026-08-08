import api from "../api/axios";

export interface BookingSlot {
  id: number;
  start_time: string;
  end_time: string;
  capacity: number;
  booked: number;
  available: boolean;
}

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