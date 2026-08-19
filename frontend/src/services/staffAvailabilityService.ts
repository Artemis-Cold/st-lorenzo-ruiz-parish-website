import api from "@/api/axios";

export interface StaffAvailabilitySlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  booked: number;
  lockedByService: string | null;
  isActive: boolean;
}

export async function getStaffAvailability() {
  const response = await api.get<{ data: StaffAvailabilitySlot[] }>("/staff/availability");
  return response.data.data;
}

export async function createStaffAvailability(dates: string[]) {
  const response = await api.post<{
    message: string;
    datesCreated: number;
    datesRestored: number;
    datesUnchanged: number;
  }>(
    "/staff/availability",
    { dates },
  );
  return response.data;
}

export async function updateStaffAvailability(id: number, isActive: boolean) {
  const response = await api.patch<{ message: string }>(
    `/staff/availability/${id}`,
    { isActive },
  );
  return response.data;
}

export async function deleteStaffAvailability(id: number) {
  await api.delete(`/staff/availability/${id}`);
}
