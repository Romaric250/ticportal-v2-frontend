import { apiClient } from "../api-client";

export const hackathonService = {
  async getCurrentHackathons() {
    const { data } = await apiClient.get("/hackathons/current");
    return data;
  },

  async getHackathonById(id: string) {
    const { data } = await apiClient.get(`/hackathons/${id}`);
    return data;
  },
};


