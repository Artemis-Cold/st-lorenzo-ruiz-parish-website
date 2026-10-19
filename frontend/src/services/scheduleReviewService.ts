import api from "@/api/axios";
import type { BookingSlot } from "./bookingSlotService";

export interface ScheduleReview {
  status: "awaiting_review" | "confirmed" | "rejected";
  reason: string | null;
  requestedAt: string | null;
  reviewedAt: string | null;
  detailsSubmitted: boolean;
}

export interface ScheduleRequest {
  id: number;
  reference: string;
  review: ScheduleReview;
  date: string;
  slot: BookingSlot;
}

export async function getScheduleRequests(service: string) {
  const response = await api.get<{ data: ScheduleRequest[] }>(
    "/schedule-requests",
    { params: { service } },
  );
  return response.data.data;
}

export async function requestSchedule(
  service: string,
  booking_slot_id: number,
) {
  const response = await api.post<{ data: ScheduleRequest }>(
    "/schedule-requests",
    { service, booking_slot_id },
  );
  return response.data.data;
}
