"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../../src/state/auth-store";

export function TopNav() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

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
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 text-xs text-slate-700">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {t("dashboard")}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleLocaleSwitch}
          className="rounded-full border border-slate-300 px-2 py-1 text-[11px] text-slate-600 hover:border-[#111827] hover:text-[#111827]"
        >
          {otherLocale === "en" ? t("english") : t("french")}
        </button>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
          <span className="h-6 w-6 rounded-full bg-slate-200" />
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold">
              {user?.name ?? "User"}
            </span>
            <span className="text-[10px] text-slate-400">
              {user?.role ?? "guest"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
