import { apiClient } from "../api-client";

export const userService = {
  async getProfile() {
    const { data } = await apiClient.get("/users/me");
    return data;
  },

  async updateProfile(payload: Record<string, unknown>) {
    const { data } = await apiClient.put("/users/me", payload);
    return data;
  },
};


