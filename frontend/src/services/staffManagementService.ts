import api from "@/api/axios";
import type {
  Booking,
  BookingStatus,
} from "@/features/staff/types/booking";
import type { MassIntention } from "@/features/staff/types/massIntention";
import type {
  RequestStatus,
  ServiceRequest,
} from "@/features/staff/types/request";
import type { IntentionStatus } from "@/features/staff/components/StatusBadge";

interface CollectionResponse<T> {
  data: T[];
}

interface ItemResponse<T> {
  data: T;
}

export async function getStaffBookings(): Promise<Booking[]> {
  const response = await api.get<CollectionResponse<Booking>>("/staff/bookings");
  return response.data.data;
}

export async function updateStaffBookingStatus(
  id: number,
  status: BookingStatus,
): Promise<Booking> {
  const response = await api.patch<ItemResponse<Booking>>(
    `/staff/bookings/${id}/status`,
    { status },
  );
  return response.data.data;
}

export async function getStaffMassIntentions(): Promise<MassIntention[]> {
  const response = await api.get<CollectionResponse<MassIntention>>(
    "/staff/mass-intentions",
  );
  return response.data.data;
}

export async function updateMassIntentionStatus(
  id: number,
  status: IntentionStatus,
): Promise<MassIntention> {
  const response = await api.patch<ItemResponse<MassIntention>>(
    `/staff/mass-intentions/${id}/status`,
    { status },
  );
  return response.data.data;
}

export async function getStaffDocumentRequests(): Promise<ServiceRequest[]> {
  const response = await api.get<CollectionResponse<ServiceRequest>>(
    "/staff/document-requests",
  );
  return response.data.data;
}

export async function updateDocumentRequestStatus(
  id: number,
  status: RequestStatus,
): Promise<ServiceRequest> {
  const response = await api.patch<ItemResponse<ServiceRequest>>(
    `/staff/document-requests/${id}/status`,
    { status },
  );
  return response.data.data;
}

export async function scheduleWeddingAppointment(
  bookingId: number,
  data: { type: "seminar" | "priest_interview"; scheduledAt: string; venue: string; notes: string },
) {
  const response = await api.post<{ data: Booking["details"]["appointments"][number] }>(
    `/staff/bookings/${bookingId}/appointments`,
    data,
  );
  return response.data.data;
}
