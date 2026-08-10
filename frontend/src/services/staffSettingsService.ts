import api from "@/api/axios";
import type { User } from "@/types/user";

export async function updateStaffProfile(data: { username: string; first_name: string; middle_initial: string; last_name: string; suffix: string; phone: string }): Promise<User> {
  const response = await api.patch<{ user: User }>("/staff/settings/profile", data);
  return response.data.user;
}

export async function updateStaffPassword(data: { current_password: string; password: string; password_confirmation: string }): Promise<void> {
  await api.patch("/staff/settings/password", data);
}

export async function createStaffAccount(data: { username: string; password: string; password_confirmation: string; first_name: string; middle_initial: string; last_name: string; phone: string }): Promise<User> {
  const response = await api.post<{ user: User }>("/staff/settings/staff", data);
  return response.data.user;
}
