import { apiClient } from "../api-client";

export const squadService = {
  async getSquads() {
    const { data } = await apiClient.get("/squads");
    return data;
  },

  async getSquadById(id: string) {
    const { data } = await apiClient.get(`/squads/${id}`);
    return data;
  },
};


