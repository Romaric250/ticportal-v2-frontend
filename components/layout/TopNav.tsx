"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { ConnectionStatus } from "../realtime/ConnectionStatus";
import { useAuthStore } from "../../src/state/auth-store";

export function TopNav() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const { user } = useAuthStore();

  const otherLocale = locale === "en" ? "fr" : "en";
  const localizedPath = `/${otherLocale}${pathname.slice(3)}`;

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2 text-xs text-slate-200">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {t("dashboard")}
        </span>
        <ConnectionStatus />
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={localizedPath}
          className="rounded-full border border-slate-300 px-2 py-1 text-[11px] text-slate-600 hover:border-[#111827] hover:text-[#111827]"
        >
          {otherLocale === "en" ? t("english") : t("french")}
        </Link>
        <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1">
          <span className="h-6 w-6 rounded-full bg-slate-800" />
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


