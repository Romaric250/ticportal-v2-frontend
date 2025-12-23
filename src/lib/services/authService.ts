import { apiClient } from "../api-client";
import type { AuthUser } from "../../state/auth-store";

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  email: string;
  password: string;
};

export const authService = {
  async login(payload: LoginPayload): Promise<AuthUser> {
    const { data } = await apiClient.post("/auth/login", payload);
    return data.user as AuthUser;
  },

  async register(payload: RegisterPayload): Promise<void> {
    await apiClient.post("/auth/register", payload);
  },

  async verifyEmail(otp: string): Promise<void> {
    await apiClient.post("/auth/verify-email", { otp });
  },

  async me(): Promise<AuthUser | null> {
    const { data } = await apiClient.get("/auth/me");
    return data.user ?? null;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },
};


