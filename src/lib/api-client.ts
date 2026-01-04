import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token storage helpers
const TOKEN_KEY = "tp_access_token";
const REFRESH_TOKEN_KEY = "tp_refresh_token";

export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setAccessToken: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  clearTokens: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
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

    // If error is not 401, reject immediately
    if (error.response?.status !== 401 || originalRequest._retry) {
      // Handle API error format: { success: false, error: {...} }
      if (error.response?.data && typeof error.response.data === "object" && "error" in error.response.data) {
        const apiError = error.response.data as { error: { code: string; message: string } };
        error.message = apiError.error.message || error.message;
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


