import { createPersistedStore } from "./store-config";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string; // ISO string for serialization
  actionUrl?: string;
};

type NotificationState = {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
};

/**
 * Notification store with persistence
 * Notifications persist across page refreshes
 */
export const useNotificationStore = createPersistedStore<NotificationState>(
  "tic-notifications",
  (set) => ({
    notifications: [],
    unreadCount: 0,
    addNotification: (notification) =>
      set((state) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          read: false,
          createdAt: new Date().toISOString(),
        };
        return {
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        };
      }),
    markAsRead: (id) =>
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.read).length,
        };
      }),
    markAllAsRead: () =>
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      })),
    removeNotification: (id) =>
      set((state) => {
        const notification = state.notifications.find((n) => n.id === id);
        const updated = state.notifications.filter((n) => n.id !== id);
        return {
          notifications: updated,
          unreadCount: notification && !notification.read
            ? state.unreadCount - 1
            : state.unreadCount,
        };
      }),
    clearAll: () =>
      set({
        notifications: [],
        unreadCount: 0,
      }),
  }),
  {
    // Only persist notifications, recalculate unreadCount on load
    partialize: (state) => ({ notifications: state.notifications }),
  }
);

