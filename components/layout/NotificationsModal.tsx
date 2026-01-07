"use client";

import { X, Bell, CheckCircle, AlertCircle, Info, Clock, Trash2, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNotifications } from "../../src/lib/hooks/useNotifications";
import type { NotificationType } from "../../src/lib/services/notificationService";

type Props = {
  onClose: () => void;
};

export function NotificationsModal({ onClose }: Props) {
  const {
    notifications,
    unreadCount,
    loading,
    pagination,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
  } = useNotifications();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);

  // Handle scroll for infinite loading
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      if (isNearBottom && pagination.page < pagination.totalPages && !loading && !isLoadingMoreRef.current) {
        isLoadingMoreRef.current = true;
        loadMore();
        setTimeout(() => {
          isLoadingMoreRef.current = false;
        }, 1000);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [pagination, loading, loadMore]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "POINTS_EARNED":
      case "ACHIEVEMENT_UNLOCKED":
        return <CheckCircle size={18} className="text-emerald-500" />;
      case "DEADLINE_REMINDER":
        return <AlertCircle size={18} className="text-amber-500" />;
      case "TEAM_MESSAGE":
      case "TEAM_INVITATION":
      case "MENTORSHIP_REQUEST":
      case "GRADE_RECEIVED":
      case "SYSTEM_ANNOUNCEMENT":
      default:
        return <Info size={18} className="text-blue-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
      }
      if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
      }
      if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? "s" : ""} ago`;
      }
      if (diffInSeconds < 2592000) {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
      }
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-[#111827]" />
            <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#111827] px-2 py-0.5 text-xs font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="cursor-pointer text-xs font-medium text-[#111827] hover:underline"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={onClose}
              className="cursor-pointer rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
          {loading && notifications.length === 0 ? (
            <div className="flex h-full items-center justify-center p-8">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center">
                <Bell size={48} className="mx-auto text-slate-300" />
                <p className="mt-4 text-sm text-slate-500">No notifications</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative p-4 transition hover:bg-slate-50 ${
                    !notification.isRead ? "bg-slate-50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">{getIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            if (!notification.isRead) {
                              markAsRead(notification.id);
                            }
                          }}
                        >
                          <p
                            className={`text-sm font-semibold ${
                              !notification.isRead
                                ? "text-slate-900"
                                : "text-slate-600"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-600">
                            {notification.message}
                          </p>
                          <p className="mt-2 text-[10px] text-slate-400">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-[#111827] mt-1" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-red-500"
                            title="Delete notification"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {pagination.page < pagination.totalPages && (
                <div className="flex justify-center p-4">
                  {loading ? (
                    <Loader2 size={20} className="animate-spin text-slate-400" />
                  ) : (
                    <button
                      onClick={loadMore}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Load more
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

