import { apiClient } from "../api-client";

export type SearchResult = {
  id: string;
  name: string;
  region?: string;
  country?: string;
};

export const defaultsService = {
  /**
   * Search for schools
   */
  async searchSchools(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }
    try {
      // The apiClient interceptor extracts data from { success: true, data: [...] }
      // So response.data should already be the array
      const response = await apiClient.get(
        `/defaults/search?type=school&q=${encodeURIComponent(query.trim())}`
      );
      
      // The interceptor should have already extracted the data array
      // response.data should be the array directly
      const data = response.data;
      
      if (Array.isArray(data)) {
        return data;
      }
      
      // Fallback: if somehow the interceptor didn't work and data is still wrapped
      if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
        return (data as any).data;
      }
      
      // Another fallback: check if it's the raw API response format
      if (data && typeof data === 'object' && 'success' in data && 'data' in data && Array.isArray((data as any).data)) {
        return (data as any).data;
      }
      
      console.warn("Unexpected API response format:", data);
      return [];
    } catch (error: any) {
      console.error("Error searching schools:", error);
      console.error("Error details:", error?.response?.data || error?.message);
      return [];
    }
  },
};

