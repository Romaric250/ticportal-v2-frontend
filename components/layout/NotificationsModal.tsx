"use client";

import { X, Bell, CheckCircle, AlertCircle, Info, Clock } from "lucide-react";
import { useState } from "react";

type Props = {
  onClose: () => void;
};

type Notification = {
  id: string;
  type: "success" | "warning" | "info" | "reminder";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
};

export function NotificationsModal({ onClose }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "Project Proposal Graded",
      message: "Your team's project proposal has been reviewed and graded.",
      time: "2 hours ago",
      isRead: false,
    },
    {
      id: "2",
      type: "warning",
      title: "Deadline Approaching",
      message: "Prototype Demo is due in 2 days. Don't forget to submit!",
      time: "5 hours ago",
      isRead: false,
    },
    {
      id: "3",
      type: "info",
      title: "New Team Member",
      message: "Alex Rivera has joined your team as Data Analyst.",
      time: "1 day ago",
      isRead: true,
    },
    {
      id: "4",
      type: "reminder",
      title: "Mentor Session Scheduled",
      message: "Your next mentor session is scheduled for Friday, Oct 28 at 2:00 PM.",
      time: "2 days ago",
      isRead: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle size={18} className="text-emerald-500" />;
      case "warning":
        return <AlertCircle size={18} className="text-amber-500" />;
      case "info":
        return <Info size={18} className="text-blue-500" />;
      case "reminder":
        return <Clock size={18} className="text-slate-500" />;
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
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
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
                  onClick={() => markAsRead(notification.id)}
                  className={`cursor-pointer p-4 transition hover:bg-slate-50 ${
                    !notification.isRead ? "bg-slate-50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">{getIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
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
                            {notification.time}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-[#111827]" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

