import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getEncryptedItem, setEncryptedItem, removeEncryptedItem } from "../utils/encryption";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
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
  const token = tokenStorage.getAccessToken();
  if (token) {
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
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
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
      // Redirect to login if we're in the browser
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    try {
      const response = await axios.post(`${apiBaseUrl}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data || response.data;
      
      if (accessToken) {
        tokenStorage.setAccessToken(accessToken);
        if (newRefreshToken) {
          tokenStorage.setRefreshToken(newRefreshToken);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        isRefreshing = false;

        return apiClient(originalRequest);
      } else {
        throw new Error("No access token in refresh response");
      }
    } catch (refreshError) {
      tokenStorage.clearTokens();
      processQueue(refreshError as AxiosError, null);
      isRefreshing = false;
      
      // Redirect to login if we're in the browser
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    }
  }
);


