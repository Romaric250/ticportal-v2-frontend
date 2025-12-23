import axios from "axios";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // rely on httpOnly cookies from backend
});

apiClient.interceptors.request.use((config) => {
  // Attach any custom headers (e.g. locale) here
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Placeholder for token refresh or redirect-to-login logic.
      // e.g. call /auth/refresh then retry original request.
    }

    return Promise.reject(error);
  }
);


