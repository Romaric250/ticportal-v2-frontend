import { useState, useEffect, useCallback, useRef } from "react";
import { notificationService, type Notification } from "../services/notificationService";
import { getSocket, connectSocket } from "../socket";
import { useAuthStore } from "../../state/auth-store";
import { toast } from "sonner";

export function useNotifications() {
  const { accessToken } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const hasInitializedRef = useRef(false);

  // Load notifications from API
  const loadNotifications = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (!accessToken) return;

      try {
        setLoading(true);
        const response = await notificationService.getNotifications(page, pagination.limit);
        
        if (append) {
          setNotifications((prev) => [...prev, ...response.notifications]);
        } else {
          setNotifications(response.notifications);
        }
        
        setPagination(response.pagination);
      } catch (error) {
        console.error("Error loading notifications:", error);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    },
    [accessToken, pagination.limit]
  );

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    if (!accessToken) return;

    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  }, [accessToken]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await notificationService.markAsRead(notificationId);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification as read:", error);
        toast.error("Failed to mark notification as read");
      }
    },
    []
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await notificationService.deleteNotification(notificationId);
        const notification = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
        toast.error("Failed to delete notification");
      }
    },
    [notifications]
  );

  // Load more notifications (pagination)
  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages && !loading) {
      loadNotifications(pagination.page + 1, true);
    }
  }, [pagination, loading, loadNotifications]);

  // Initialize: Load notifications and unread count
  useEffect(() => {
    if (accessToken && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      loadNotifications(1, false);
      loadUnreadCount();
    }
  }, [accessToken, loadNotifications, loadUnreadCount]);

  // Set up socket listeners for real-time updates
  useEffect(() => {
    if (!accessToken) return;

    const socket = connectSocket(accessToken);
    socketRef.current = socket;

    // Listen for new notifications
    const onNewNotification = (notification: Notification) => {
      console.log("Socket: New notification received", notification);
      
      // Add to notifications list (prepend)
      setNotifications((prev) => [notification, ...prev]);
      
      // Update unread count
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
      
      // Show toast notification
      toast.info(notification.message, {
        description: notification.title,
        duration: 5000,
      });
    };

    // Listen for unread count updates
    const onUnreadCountUpdate = (data: { count: number }) => {
      console.log("Socket: Unread count updated", data);
      setUnreadCount(data.count);
    };

    socket.on("notification:new", onNewNotification);
    socket.on("notification:unread-count", onUnreadCountUpdate);

    return () => {
      socket.off("notification:new", onNewNotification);
      socket.off("notification:unread-count", onUnreadCountUpdate);
    };
  }, [accessToken]);

  return {
    notifications,
    unreadCount,
    loading,
    pagination,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
  };
}

