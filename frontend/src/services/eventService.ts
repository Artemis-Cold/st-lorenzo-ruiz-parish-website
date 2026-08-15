import api from "@/api/axios";

export interface ParishEvent {
  id: number;
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

export async function getStaffEvents(): Promise<ParishEvent[]> {
  const response = await api.get<{ data: ParishEvent[] }>("/staff/events");
  return response.data.data;
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
