import { apiClient } from "../api-client";

export const learningPathService = {
  async getStages() {
    const { data } = await apiClient.get("/learning-path/stages");
    return data;
  },

  async getStageById(id: string) {
    const { data } = await apiClient.get(`/learning-path/stages/${id}`);
    return data;
  },
};


