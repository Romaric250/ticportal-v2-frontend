import { apiClient } from "../api-client";

export const teamService = {
  async getMyTeams() {
    const { data } = await apiClient.get("/teams/my");
    return data;
  },

  async getTeamById(id: string) {
    const { data } = await apiClient.get(`/teams/${id}`);
    return data;
  },
};


