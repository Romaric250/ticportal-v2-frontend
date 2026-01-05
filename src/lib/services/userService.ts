import { apiClient } from "../api-client";

export type UserProfile = {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  bio?: string;
  profilePhoto?: string;
  school?: string;
  grade?: string;
  country?: string;
  region?: string;
  gradDate?: string;
};

export type UpdateProfilePayload = {
  username?: string;
  bio?: string;
  school?: string;
  grade?: string;
  country?: string;
  region?: string;
  gradDate?: string;
};

export type UpdateProfilePhotoPayload = {
  profilePhoto: string; // Base64 data URL
};

export type SearchUserResult = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  profilePhoto?: string;
  role?: string;
};

export const userService = {
  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>("/users/profile");
    return data;
  },

  /**
   * Update user profile
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const { data } = await apiClient.put<UserProfile>("/users/profile", payload);
    return data;
  },

  /**
   * Update profile photo
   */
  async updateProfilePhoto(payload: UpdateProfilePhotoPayload): Promise<UserProfile> {
    const { data } = await apiClient.put<UserProfile>("/users/profile-photo", payload);
    return data;
  },

  /**
   * Search users by name or email
   */
  async searchUsers(query: string): Promise<SearchUserResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }
    try {
      const { data } = await apiClient.get<SearchUserResult[]>(
        `/users/search?q=${encodeURIComponent(query.trim())}&type=user`
      );
      return data || [];
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  },
};


