"use client";

import { Bell } from "lucide-react";
import { useNotifications } from "../../src/lib/hooks/useNotifications";

type Props = {
  onOpen: () => void;
};

export function NotificationsButton({ onOpen }: Props) {
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={onOpen}
      className="cursor-pointer relative rounded-full p-1.5 sm:p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
      title="Notifications"
    >
      <Bell size={16} className="sm:w-[18px] sm:h-[18px]" />
      {unreadCount > 0 && (
        <span className="absolute right-0.5 top-0.5 sm:right-1 sm:top-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-red-500 text-[9px] sm:text-[10px] font-semibold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}

