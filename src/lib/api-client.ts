import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getEncryptedItem, setEncryptedItem, removeEncryptedItem } from "../utils/encryption";

// Extend AxiosRequestConfig to include skipRefresh option
declare module "axios" {
  export interface AxiosRequestConfig {
    skipRefresh?: boolean;
  }
}

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Required for CORS with credentials
});

// Token storage helpers with encryption
const TOKEN_KEY = "tp_access_token";
const REFRESH_TOKEN_KEY = "tp_refresh_token";

export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return getEncryptedItem(TOKEN_KEY);
  },
  setAccessToken: (token: string): void => {
    if (typeof window === "undefined") return;
    setEncryptedItem(TOKEN_KEY, token);
  },
  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return getEncryptedItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken: (token: string): void => {
    if (typeof window === "undefined") return;
    setEncryptedItem(REFRESH_TOKEN_KEY, token);
  },
  clearTokens: (): void => {
    if (typeof window === "undefined") return;
    removeEncryptedItem(TOKEN_KEY);
    removeEncryptedItem(REFRESH_TOKEN_KEY);
  },
};

// Request interceptor: Add Authorization header
apiClient.interceptors.request.use((config) => {
  // Always get the latest token from storage (in case it was refreshed)
  const token = tokenStorage.getAccessToken();
  if (token) {
    // Always override with latest token from storage
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  const queue = [...failedQueue];
  failedQueue = [];
  queue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
};

apiClient.interceptors.response.use(
  (response) => {
    // Extract response data based on API format: { success: true, data: {...} }
    if (response.data?.success && response.data?.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Skip refresh if explicitly requested (e.g., for payment endpoints)
    if (originalRequest?.skipRefresh) {
      return Promise.reject(error);
    }

    // Skip refresh for auth endpoints - they handle their own errors
    // Login, register, reset-password, etc. should not trigger token refresh
    const authEndpoints = ['/auth/login', '/auth/register', '/auth/reset-password', '/auth/send-otp', '/auth/verify-otp'];
    if (originalRequest?.url && authEndpoints.some(endpoint => originalRequest.url?.includes(endpoint))) {
      return Promise.reject(error);
    }

    // Handle 403 (Forbidden) errors - these are permission issues, not auth issues
    // Don't clear tokens or redirect, just show the error
    if (error.response?.status === 403) {
      // Extract error message from response
      if (error.response?.data) {
        let errorMessage = "Forbidden - insufficient permissions";
        
        // Check for API error format: { success: false, error: {...} }
        if (
          typeof error.response.data === "object" &&
          "error" in error.response.data &&
          typeof (error.response.data as { error: unknown }).error === "object" &&
          !Array.isArray((error.response.data as { error: unknown }).error)
        ) {
          const apiError = error.response.data as { error: { code: string; message: string } };
          errorMessage = apiError.error.message || errorMessage;
        }
        
        error.message = errorMessage;
      }
      return Promise.reject(error);
    }

    // If error is not 401, reject immediately
    if (error.response?.status !== 401 || originalRequest._retry) {
      // Handle API error format and validation errors
      if (error.response?.data) {
        let validationErrors: Array<{
          code: string;
          path: string[];
          message: string;
          values?: unknown[];
        }> | null = null;

        // Check if error data is an array (validation errors)
        if (Array.isArray(error.response.data)) {
          validationErrors = error.response.data;
        }
        // Check if error data has an error property that is an array
        else if (
          typeof error.response.data === "object" &&
          "error" in error.response.data &&
          Array.isArray((error.response.data as { error: unknown }).error)
        ) {
          validationErrors = (error.response.data as { error: unknown[] }).error as Array<{
            code: string;
            path: string[];
            message: string;
            values?: unknown[];
          }>;
        }
        // Check if error data has a nested errors array
        else if (
          typeof error.response.data === "object" &&
          "errors" in error.response.data &&
          Array.isArray((error.response.data as { errors: unknown }).errors)
        ) {
          validationErrors = (error.response.data as { errors: unknown[] }).errors as Array<{
            code: string;
            path: string[];
            message: string;
            values?: unknown[];
          }>;
        }

        // Process validation errors
        if (validationErrors && validationErrors.length > 0) {
          const errorMessages = validationErrors.map((err) => {
            const field = err.path?.join(".") || "Field";
            // Convert field names to user-friendly format
            const friendlyField = field
              .split(".")
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1).replace(/_/g, " "))
              .join(" ");
            
            // For invalid_value errors, show a more user-friendly message
            if (err.code === "invalid_value") {
              // Special handling for role field
              if (field.toLowerCase() === "role") {
                return "Please select a valid role (Student or Mentor)";
              }
              if (err.values && Array.isArray(err.values) && err.values.length > 0) {
                const validValues = err.values.map((v) => String(v)).join(", ");
                return `${friendlyField} must be one of: ${validValues}`;
              }
              return `${friendlyField}: ${err.message}`;
            }
            return `${friendlyField}: ${err.message}`;
          });
          
          error.message = errorMessages.join(". ");
        }
        // Handle standard API error format: { success: false, error: {...} }
        else if (
          typeof error.response.data === "object" &&
          "error" in error.response.data &&
          typeof (error.response.data as { error: unknown }).error === "object" &&
          !Array.isArray((error.response.data as { error: unknown }).error)
        ) {
          const apiError = error.response.data as { error: { code: string; message: string } };
          error.message = apiError.error.message || error.message;
        }
      }
      return Promise.reject(error);
    }

    // If already refreshing, queue the request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers && token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          // Retry the original request with new token
          return apiClient(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      tokenStorage.clearTokens();
      processQueue(error, null);
      isRefreshing = false;
      // Don't redirect if we're already on a login/auth page - let the component handle it
      if (typeof window !== "undefined" && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    try {
      const response = await axios.post(`${apiBaseUrl}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data || response.data;
      
      if (!accessToken) {
        throw new Error("No access token in refresh response");
      }

      // Store new tokens
      tokenStorage.setAccessToken(accessToken);
      if (newRefreshToken) {
        tokenStorage.setRefreshToken(newRefreshToken);
      }

      // Update auth store if available (for Zustand store sync)
      if (typeof window !== "undefined" && (window as any).__AUTH_STORE_UPDATE__) {
        try {
          (window as any).__AUTH_STORE_UPDATE__(accessToken, newRefreshToken);
        } catch (e) {
          // Store update failed, continue anyway
        }
      }

      // Process queued requests with new token
      processQueue(null, accessToken);
      isRefreshing = false;

      // Retry the original request - request interceptor will use new token from storage
      // Don't modify originalRequest.headers here, let the interceptor handle it
      return apiClient(originalRequest);
    } catch (refreshError) {
      tokenStorage.clearTokens();
      processQueue(refreshError as AxiosError, null);
      isRefreshing = false;
      
      // Don't redirect if we're already on a login/auth page - let the component handle it
      if (typeof window !== "undefined" && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    }
  }
);


