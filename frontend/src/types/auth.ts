import type { User } from "./user";

export interface LoginCredentials {
  username: string;

  password: string;
}

export interface RegisterRequest {
  username: string;

  password: string;

  password_confirmation: string;

  first_name: string;

  middle_name?: string;

  last_name: string;

  suffix?: string;

  phone: string;

  house_no: string;

  street: string;

  barangay: string;

  municipality: string;

  province: string;

  zip_code: string;

  birth_date: string;

  gender: string;
}

export interface AuthPayload {
  token: string;

  user: User;
}

export interface MeResponse {
  user: User;
}