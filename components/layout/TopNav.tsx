"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { UserProfileMenu } from "./UserProfileMenu";
import { NotificationsModal } from "./NotificationsModal";

export function TopNav() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

  const otherLocale = locale === "en" ? "fr" : "en";

  const handleLocaleSwitch = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("tp_locale", otherLocale);
    }

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      router.push(`/${otherLocale}`);
      return;
    }
    segments[0] = otherLocale;
    const localizedPath = `/${segments.join("/")}`;

    router.push(localizedPath);
  };

  return (
    <>
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 text-sm text-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("dashboard")}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLocaleSwitch}
            className="cursor-pointer rounded-full border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:border-[#111827] hover:text-[#111827]"
          >
            {otherLocale === "en" ? t("english") : t("french")}
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => setShowNotifications(true)}
            className="cursor-pointer relative rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <Bell size={18} />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* User Profile Menu */}
          <UserProfileMenu />
        </div>
      </header>

      {/* Notifications Modal */}
      {showNotifications && (
        <NotificationsModal onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
}
