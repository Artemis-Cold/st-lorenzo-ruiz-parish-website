import api from "./axios";

import type {
  LoginCredentials,
  RegisterRequest,
  AuthPayload,
  MeResponse,
} from "@/types/auth";

export const register = async (
  data: RegisterRequest,
): Promise<AuthPayload> => {
  const response = await api.post<AuthPayload>(
    "/auth/register",
    data,
  );

  return response.data;
};

export const login = async (
  data: LoginCredentials,
): Promise<AuthPayload> => {
  const response = await api.post<AuthPayload>(
    "/auth/login",
    data,
  );

  return response.data;
};

export const me = async (): Promise<MeResponse> => {
  const response = await api.get<MeResponse>("/auth/me");

  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};