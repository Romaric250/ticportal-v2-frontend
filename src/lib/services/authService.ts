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
  role: "STUDENT" | "MENTOR" | "JUDGE" | "SQUAD_LEAD" | "ADMIN" | "SUPER_ADMIN";
};

type VerifyOTPPayload = {
  email: string;
  code: string;
  type: "EMAIL_VERIFICATION" | "PASSWORD_RESET";
};

type ForgotPasswordPayload = {
  email: string;
  type: "PASSWORD_RESET";
};

type ResetPasswordPayload = {
  email: string;
  code: string;
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
   * Verify OTP for email verification or password reset
   * Returns user data and tokens on success (for EMAIL_VERIFICATION)
   */
  async verifyOTP(payload: VerifyOTPPayload): Promise<AuthResponse | void> {
    const { data } = await apiClient.post<AuthResponse | void>("/auth/verify-otp", payload);
    return data;
  },

  /**
   * Verify email with OTP (convenience method)
   * Returns user data and tokens on success
   */
  async verifyEmail(email: string, code: string): Promise<AuthResponse> {
    const response = await this.verifyOTP({
      email,
      code,
      type: "EMAIL_VERIFICATION",
    });
    return response as AuthResponse;
  },

  /**
   * Login with email and password
   * Returns user data and tokens
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", payload);
      // The interceptor already extracts data from { success: true, data: {...} }
      // So response.data should be the AuthResponse directly
      return response.data;
    } catch (error: any) {
      // Re-throw with better error message
      throw error;
    }
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
    await apiClient.post("/auth/send-otp", { email: payload.email, type: "PASSWORD_RESET" });
  },

  /**
   * Reset password with OTP code
   */
  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await apiClient.post("/auth/reset-password", payload);
  },
};


