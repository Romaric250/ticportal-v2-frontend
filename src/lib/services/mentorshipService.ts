import { apiClient } from "../api-client";

export const mentorshipService = {
  async getMyRequests() {
    const { data } = await apiClient.get("/mentorship/requests/my");
    return data;
  },

  async createRequest(payload: Record<string, unknown>) {
    const { data } = await apiClient.post("/mentorship/requests", payload);
    return data;
  },
};


