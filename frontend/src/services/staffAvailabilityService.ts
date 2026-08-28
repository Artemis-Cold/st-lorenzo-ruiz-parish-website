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

export interface MonthlyAvailabilityResult {
  message: string;
  datesOpened: number;
  recordsCreated: number;
  recordsSkipped: number;
}

export async function getStaffAvailability(month: string) {
  const response = await api.get<{
    data: StaffAvailabilitySlot[];
    month: string;
  }>("/staff/availability", {
    params: { month },
  });

  return response.data.data;
}

export async function createStaffAvailability(
  month: string,
): Promise<MonthlyAvailabilityResult> {
  const response = await api.post<MonthlyAvailabilityResult>(
    "/staff/availability",
    { month },
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
