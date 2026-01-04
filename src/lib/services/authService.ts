import { apiClient, tokenStorage } from "../api-client";
import type { AuthUser } from "../../state/auth-store";

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

type VerifyEmailPayload = {
  email: string;
  otp: string;
};

type ForgotPasswordPayload = {
  email: string;
};

type ResetPasswordPayload = {
  email: string;
  otp: string;
  newPassword: string;
};

type RefreshTokenPayload = {
  refreshToken: string;
};

type LogoutPayload = {
  refreshToken: string;
};

type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

export const authService = {
  /**
   * Register a new user
   * Sends OTP to email (valid for 10 minutes)
   */
  async register(payload: RegisterPayload): Promise<void> {
    await apiClient.post("/auth/register", payload);
  },

  /**
   * Verify email with OTP
   * Returns user data and tokens on success
   */
  async verifyEmail(payload: VerifyEmailPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/verify-email", payload);
    return data;
  },

  /**
   * Login with email and password
   * Returns user data and tokens
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(payload: RefreshTokenPayload): Promise<RefreshResponse> {
    const { data } = await apiClient.post<RefreshResponse>("/auth/refresh", payload);
    return data;
  },

  /**
   * Logout - invalidates refresh token
   */
  async logout(payload: LogoutPayload): Promise<void> {
    try {
      await apiClient.post("/auth/logout", payload);
    } finally {
      // Always clear tokens even if API call fails
      tokenStorage.clearTokens();
    }
  },

  /**
   * Request password reset OTP
   * Sends OTP to email if user exists
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await apiClient.post("/auth/forgot-password", payload);
  },

  /**
   * Reset password with OTP
   */
  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await apiClient.post("/auth/reset-password", payload);
  },
};


