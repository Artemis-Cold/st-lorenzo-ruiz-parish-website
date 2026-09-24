import type { User } from "./user";

export interface LoginCredentials {
  username: string;

  password: string;
}

export interface RegisterRequest {
  password: string;

  password_confirmation: string;

  terms_accepted: boolean;

  first_name: string;

  middle_initial?: string;

  last_name: string;

  suffix?: string;

  phone: string;

  house_no?: string;

  street?: string;

  barangay?: string;

  municipality?: string;

  province?: string;

  zip_code?: string;

  birth_date?: string;

  gender?: string;
}

export interface AuthPayload {
  token: string;

  user: User;
}

export interface RegistrationPayload extends AuthPayload {
  message: string;

  verification: {
    required: boolean;
    otp_sent: boolean;
  };
}

export interface MeResponse {
  user: User;
}
