import api from "@/api/axios";

export interface StaffAvailabilitySlot {
  id: number;
  serviceCode: "wedding" | "baptism" | "funeral";
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  isActive: boolean;
}

export async function getStaffAvailability() {
  const response = await api.get<{ data: StaffAvailabilitySlot[] }>("/staff/availability");
  return response.data.data;
}

export async function createStaffAvailability(input: {
  serviceCode: "wedding" | "baptism" | "funeral";
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
}) {
  const response = await api.post<{ data: StaffAvailabilitySlot }>("/staff/availability", input);
  return response.data.data;
}

export async function updateStaffAvailability(id: number, input: { capacity?: number; isActive?: boolean }) {
  const response = await api.patch<{ data: StaffAvailabilitySlot }>(`/staff/availability/${id}`, input);
  return response.data.data;
}

export async function deleteStaffAvailability(id: number) {
  await api.delete(`/staff/availability/${id}`);
}
