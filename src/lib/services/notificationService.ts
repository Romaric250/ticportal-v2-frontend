import { apiClient, tokenStorage } from "../api-client";
import axios from "axios";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

export type NotificationType =
  | "POINTS_EARNED"
  | "TEAM_MESSAGE"
  | "TEAM_INVITATION"
  | "MENTORSHIP_REQUEST"
  | "DEADLINE_REMINDER"
  | "ACHIEVEMENT_UNLOCKED"
  | "GRADE_RECEIVED"
  | "SYSTEM_ANNOUNCEMENT";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
};

export type NotificationResponse = {
  success: true;
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UnreadCountResponse = {
  success: true;
  count: number;
};

export type MarkReadPayload = {
  notificationId: string;
};

export const notificationService = {
  /**
   * Get notifications with pagination
   */
  async getNotifications(page: number = 1, limit: number = 20): Promise<NotificationResponse> {
    // Use axios directly to preserve pagination data structure (bypass apiClient interceptor)
    const token = tokenStorage.getAccessToken();
    
    const response = await axios.get<NotificationResponse>(
      `${apiBaseUrl}/notifications?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      }
    );
    
    // Handle response format: { success: true, notifications: [...], pagination: {...} }
    if (response.data.success) {
      return response.data;
    }
    
    throw new Error("Failed to fetch notifications");
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    // Use axios directly to preserve response structure
    const token = tokenStorage.getAccessToken();
    
    const response = await axios.get<UnreadCountResponse>(
      `${apiBaseUrl}/notifications/unread-count`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      }
    );
    
    // Handle response format: { success: true, count: 5 }
    if (response.data.success) {
      return response.data.count;
    }
    
    return 0;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.post("/notifications/mark-read", {
      notificationId,
    });
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.post("/notifications/mark-all-read");
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`/notifications/${notificationId}`);
  },
};

