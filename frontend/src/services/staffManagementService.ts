import api from "@/api/axios";
import type { Booking, BookingStatus } from "@/features/staff/types/booking";
import type {
  IntentionType,
  MassIntention,
} from "@/features/staff/types/massIntention";
import type {
  RequestStatus,
  ServiceRequest,
} from "@/features/staff/types/request";

export interface StaffBookingFilters {
  service?: "wedding" | "funeral" | "baptism";
  status?: BookingStatus;
  search?: string;
  date?: string;
  page?: number;
  perPage?: number;
}

export interface StaffBookingPage {
  data: Booking[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

interface ItemResponse<T> {
  data: T;
}

export async function getStaffBookings(
  filters: StaffBookingFilters = {},
  signal?: AbortSignal,
): Promise<StaffBookingPage> {
  const response = await api.get<StaffBookingPage>("/staff/bookings", {
    params: {
      service: filters.service,
      status: filters.status,
      search: filters.search || undefined,
      date: filters.date || undefined,
      page: filters.page,
      per_page: filters.perPage,
    },
    signal,
  });
  return response.data;
}

export async function getAllStaffBookings(
  filters: Omit<StaffBookingFilters, "page" | "perPage">,
): Promise<Booking[]> {
  const firstPage = await getStaffBookings({
    ...filters,
    page: 1,
    perPage: 100,
  });

  if (firstPage.meta.last_page <= 1) return firstPage.data;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.meta.last_page - 1 }, (_, index) =>
      getStaffBookings({ ...filters, page: index + 2, perPage: 100 }),
    ),
  );

  return [firstPage, ...remainingPages].flatMap((result) => result.data);
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

export async function sendBookingRequirementsReminder(
  id: number,
): Promise<string> {
  const response = await api.post<{ message: string }>(
    `/staff/bookings/${id}/requirements/remind`,
  );
  return response.data.message;
}

export async function sendBookingPaymentReminder(id: number): Promise<string> {
  const response = await api.post<{ message: string }>(
    `/staff/bookings/${id}/payment/remind`,
  );
  return response.data.message;
}

export interface StaffMassIntentionFilters {
  type?: IntentionType;
  status?: MassIntention["status"];
  search?: string;
  date?: string;
  time?: string;
  page?: number;
  perPage?: number;
}

export interface StaffMassIntentionPage {
  data: MassIntention[];
  meta: StaffBookingPage["meta"];
}

export async function getStaffMassIntentions(
  filters: StaffMassIntentionFilters = {},
  signal?: AbortSignal,
): Promise<StaffMassIntentionPage> {
  const response = await api.get<StaffMassIntentionPage>(
    "/staff/mass-intentions",
    {
      params: {
        type: filters.type,
        status: filters.status,
        search: filters.search || undefined,
        date: filters.date || undefined,
        time: filters.time || undefined,
        page: filters.page,
        per_page: filters.perPage,
      },
      signal,
    },
  );
  return response.data;
}

export async function getAllStaffMassIntentions(
  filters: Omit<StaffMassIntentionFilters, "page" | "perPage">,
): Promise<MassIntention[]> {
  const firstPage = await getStaffMassIntentions({
    ...filters,
    page: 1,
    perPage: 100,
  });

  if (firstPage.meta.last_page <= 1) return firstPage.data;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.meta.last_page - 1 }, (_, index) =>
      getStaffMassIntentions({ ...filters, page: index + 2, perPage: 100 }),
    ),
  );

  return [firstPage, ...remainingPages].flatMap((result) => result.data);
}

export interface StaffDocumentRequestFilters {
  status?: RequestStatus;
  search?: string;
  date?: string;
  page?: number;
  perPage?: number;
}

export interface StaffDocumentRequestPage {
  data: ServiceRequest[];
  meta: StaffBookingPage["meta"];
}

export async function getStaffDocumentRequests(
  filters: StaffDocumentRequestFilters = {},
  signal?: AbortSignal,
): Promise<StaffDocumentRequestPage> {
  const response = await api.get<StaffDocumentRequestPage>(
    "/staff/document-requests",
    {
      params: {
        status: filters.status,
        search: filters.search || undefined,
        date: filters.date || undefined,
        page: filters.page,
        per_page: filters.perPage,
      },
      signal,
    },
  );
  return response.data;
}

export async function getAllStaffDocumentRequests(
  filters: Omit<StaffDocumentRequestFilters, "page" | "perPage">,
): Promise<ServiceRequest[]> {
  const firstPage = await getStaffDocumentRequests({
    ...filters,
    page: 1,
    perPage: 100,
  });

  if (firstPage.meta.last_page <= 1) return firstPage.data;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.meta.last_page - 1 }, (_, index) =>
      getStaffDocumentRequests({ ...filters, page: index + 2, perPage: 100 }),
    ),
  );

  return [firstPage, ...remainingPages].flatMap((result) => result.data);
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

export async function scheduleBookingAppointment(
  bookingId: number,
  data: {
    type: "seminar" | "priest_interview";
    scheduledAt: string;
    venue: string;
    notes: string;
  },
) {
  const response = await api.post<{
    data: Booking["details"]["appointments"][number];
  }>(`/staff/bookings/${bookingId}/appointments`, data);
  return response.data.data;
}
