import api from "./axios";

import type {
  LoginCredentials,
  RegisterRequest,
  AuthPayload,
  MeResponse,
} from "@/types/auth";

import type { User } from "@/types/user";
import type { Address } from "@/types/address";

export const register = async (data: RegisterRequest): Promise<AuthPayload> => {
  const response = await api.post<AuthPayload>("/auth/register", data);

  return response.data;
};

export const login = async (data: LoginCredentials): Promise<AuthPayload> => {
  const response = await api.post<AuthPayload>("/auth/login", data);

  return response.data;
};

export const staffLogin = async (
  data: LoginCredentials,
): Promise<AuthPayload> => {
  const response = await api.post<AuthPayload>("/auth/staff/login", data);

  return response.data;
};

export type PasswordResetPortal = "parishioner" | "staff";

export async function requestPasswordResetOtp(username: string, phone: string, portal: PasswordResetPortal) {
  const response = await api.post<{ message: string }>("/auth/password/otp", { username, phone, portal });
  return response.data;
}

export async function resetPasswordWithOtp(data: {
  username: string;
  phone: string;
  portal: PasswordResetPortal;
  otp: string;
  password: string;
  password_confirmation: string;
}) {
  const response = await api.post<{ message: string }>("/auth/password/reset", data);
  return response.data;
}

export const me = async (): Promise<MeResponse> => {
  const response = await api.get<MeResponse>("/auth/me");

  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const completeProfile = async (
  data: Partial<Address> & {
    barangay: string;
    municipality: string;
    province: string;
    birth_date: string;
    gender: string;
  },
): Promise<{ user: User }> => {
  const response = await api.patch<{ user: User }>("/profile/complete", data);

  return response.data;
};

export interface UpdateProfileData {
  first_name: string;
  middle_initial: string;
  last_name: string;
  suffix: string;
  phone: string;
  birth_date: string;
  gender: "Male" | "Female";
  house_no: string;
  street: string;
  barangay: string;
  municipality: string;
  province: string;
  zip_code: string;
}

export const updateProfile = async (
  data: UpdateProfileData,
): Promise<{ message: string; user: User }> => {
  const response = await api.patch<{ message: string; user: User }>(
    "/profile",
    data,
  );

  return response.data;
};

export const updateParishionerPassword = async (data: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> => {
  const response = await api.patch<{ message: string }>(
    "/profile/password",
    data,
  );

  return response.data;
};

export interface ProfileBooking {
  id: number;
  booking_reference: string;
  service: string;
  package: string | null;
  status: "pending" | "approved" | "ready_for_pickup" | "rejected" | "cancelled" | "completed";
  booking_date: string | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
}

export interface ProfileDocument {
  id: number;
  booking_id: number;
  booking_reference: string;
  document_type: string;
  status: ProfileBooking["status"];
  price: string;
  requested_at: string;
}

export const getProfile = async (): Promise<{
  user: User;
  current_bookings: ProfileBooking[];
  recent_bookings: ProfileBooking[];
  documents: ProfileDocument[];
}> => {
  const response = await api.get<{
    user: User;
    current_bookings: ProfileBooking[];
    recent_bookings: ProfileBooking[];
    documents: ProfileDocument[];
  }>("/profile");

  return response.data;
};

export const updateProfilePhoto = async (
  photo: File,
): Promise<{ message: string; user: User }> => {
  const formData = new FormData();
  formData.append("profile_photo", photo);

  const response = await api.post<{ message: string; user: User }>(
    "/profile/photo",
    formData,
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};
