"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import {
  LayoutDashboard,
  ListOrdered,
  Layers,
  Wallet,
  Users,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "../../../../../src/utils/cn";

const subNavItems = [
  { href: "command-center", label: "Command Center", icon: LayoutDashboard },
  { href: "affiliate-marketers", label: "Affiliate Marketers", icon: Users },
  { href: "system-ledger", label: "System Ledger", icon: ListOrdered },
  { href: "commission-tiers", label: "Commission Tiers", icon: Layers },
  { href: "payouts", label: "Payouts", icon: Wallet },
  { href: "settings", label: "Settings", icon: Settings },
];

type Props = { children: ReactNode };

export default function AffiliateManagementLayout({ children }: Props) {
  const pathname = usePathname();
  const locale = useLocale();
  const baseHref = `/${locale}/admin/affiliate-management`;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:gap-4 lg:gap-6">
      {/* Mobile: horizontal scroll tabs — minimal vertical space, full width for content */}
      <div className="w-full overflow-x-auto md:hidden">
        <div className="flex gap-1.5 pb-1">
          <span className="sticky left-0 z-10 shrink-0 bg-[#f9fafb] pr-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Oversight
          </span>
          <nav className="flex gap-1.5" style={{ minWidth: "min-content" }}>
            {subNavItems.map((item) => {
              const href = `${baseHref}/${item.href}`;
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={href}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors",
                    isActive
                      ? "border-slate-700 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <Icon size={14} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop: collapsible sidebar — toggle for more content space */}
      <aside
        className={cn(
          "hidden shrink-0 transition-[width] duration-200 md:block",
          sidebarOpen ? "md:w-44 lg:w-52" : "w-14"
        )}
      >
        <div className="sticky top-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-1 p-2">
            {sidebarOpen && (
              <p className="truncate px-1 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Financial Oversight
              </p>
            )}
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? (
                <PanelLeftClose size={18} />
              ) : (
                <PanelLeft size={18} />
              )}
            </button>
          </div>
          <nav className={cn("space-y-0.5 p-2", !sidebarOpen && "px-1.5")}>
            {subNavItems.map((item) => {
              const href = `${baseHref}/${item.href}`;
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
                    !sidebarOpen && "justify-center px-0",
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon size={16} className="shrink-0" />
                  {sidebarOpen && (
                    <span className="truncate text-sm">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
