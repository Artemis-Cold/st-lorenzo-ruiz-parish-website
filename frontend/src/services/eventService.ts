import api from "@/api/axios";

export interface ParishEvent {
  id: number;
  category: "event" | "mass";
  title: string;
  details: string;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  status: "upcoming" | "ongoing" | "past";
  createdBy: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface ParishEventInput {
  title: string;
  details: string;
  location: string;
  startsAt: string;
  endsAt: string;
}

export async function getPublicEvents(month?: string): Promise<ParishEvent[]> {
  const response = await api.get<{ data: ParishEvent[] }>("/events", {
    params: month ? { month } : undefined,
  });
  return response.data.data;
}

export type StaffEventGroup = "events" | "masses" | "past";

export interface StaffEventPage {
  data: ParishEvent[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

export async function getStaffEvents(params: {
  group?: StaffEventGroup;
  search?: string;
  page?: number;
  perPage?: number;
} = {}): Promise<StaffEventPage> {
  const response = await api.get<StaffEventPage>("/staff/events", { params });
  return response.data;
}

export async function createEvent(input: ParishEventInput): Promise<ParishEvent> {
  const response = await api.post<{ data: ParishEvent }>("/staff/events", input);
  return response.data.data;
}

export async function updateEvent(id: number, input: ParishEventInput): Promise<ParishEvent> {
  const response = await api.put<{ data: ParishEvent }>(`/staff/events/${id}`, input);
  return response.data.data;
}

export async function deleteEvent(id: number): Promise<void> {
  await api.delete(`/staff/events/${id}`);
}

export interface MassScheduleInput {
  month: string;
  location: string;
}

export interface MassScheduleResult {
  message: string;
  created: number;
  skipped: number;
}

export async function createMassSchedule(
  input: MassScheduleInput,
): Promise<MassScheduleResult> {
  const response = await api.post<MassScheduleResult>(
    "/staff/events/mass-schedule",
    input,
  );

  return response.data;
}
