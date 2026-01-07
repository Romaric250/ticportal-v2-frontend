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
      className="cursor-pointer relative rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      title="Notifications"
    >
      <Bell size={18} />
      {unreadCount > 0 && (
        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}

