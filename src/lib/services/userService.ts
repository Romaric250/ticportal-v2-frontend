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
  gradDate?: string;
};

export type UpdateProfilePayload = {
  username?: string;
  bio?: string;
  school?: string;
  grade?: string;
  country?: string;
  gradDate?: string;
};

export type UpdateProfilePhotoPayload = {
  profilePhoto: string; // Base64 data URL
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
};


