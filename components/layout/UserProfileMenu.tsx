"use client";

import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuthStore } from "../../src/state/auth-store";
import { authService } from "../../src/lib/services/authService";
import { toast } from "sonner";

export function UserProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const locale = useLocale();
  const { user, refreshToken, logout } = useAuthStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);
    try {
      if (refreshToken) {
        await authService.logout({ refreshToken });
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if API call fails
    } finally {
      logout();
      toast.success("Logged out successfully");
      router.push(`/${locale}/login`);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50 transition"
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#111827] to-slate-500 flex items-center justify-center text-white text-xs font-semibold">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-slate-900">
            {user?.name || "User"}
          </p>
          <p className="text-[10px] text-slate-500 capitalize">
            {user?.role || "guest"}
          </p>
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
          <div className="p-2">
            <div className="mb-2 rounded-lg bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#111827] to-slate-500 flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <button className="cursor-pointer flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <User size={16} className="text-slate-500" />
                <span>View Profile</span>
              </button>
              <button className="cursor-pointer flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <Settings size={16} className="text-slate-500" />
                <span>Settings</span>
              </button>
              <div className="my-1 h-px bg-slate-100" />
              <button
                onClick={handleSignOut}
                className="cursor-pointer flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

