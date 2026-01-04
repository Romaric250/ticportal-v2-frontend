"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Home, Activity, Trophy, Flag, User, BookOpen, Settings, LogOut, ChevronLeft, ChevronRight, Users, MessageSquare } from "lucide-react";
import { cn } from "../../src/utils/cn";

type SidebarLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

type Props = {
  role: "student" | "mentor" | "judge" | "admin" | "super-admin";
};

export function Sidebar({ role }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();

  // Auto-collapse on mobile (only on initial load)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      // lg breakpoint - auto-collapse on mobile
      setCollapsed(true);
    }
  }, []);

  const basePath = `/${locale}/${role}`;

  const links: SidebarLink[] = [
    { href: `${basePath}`, label: "Overview", icon: <Home size={16} /> },
    { href: `${basePath}/tic-feed`, label: "TIC Feed", icon: <Activity size={16} /> },
    ...(role === "student"
      ? [
          { href: `${basePath}/learning-path`, label: "Learning Path", icon: <BookOpen size={16} /> },
          { href: `${basePath}/portfolio`, label: "Portfolio", icon: <User size={16} /> },
          { href: `${basePath}/team`, label: "My Team", icon: <Users size={16} /> },
          { href: `${basePath}/community`, label: "TIC Community", icon: <MessageSquare size={16} /> },
        ]
      : []),
    { href: `${basePath}/leaderboard`, label: "Leaderboard", icon: <Trophy size={16} /> },
    { href: `${basePath}/hackathons`, label: "Hackathons", icon: <Flag size={16} /> },
  ];

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-slate-200 bg-slate-50 transition-all",
        collapsed ? "w-16" : "w-64"
      )}
      style={collapsed ? { overflow: 'visible', overflowY: 'auto', zIndex: 50 } : { overflow: 'hidden', zIndex: 10 }}
    >
      <div className="flex items-center justify-between px-3 py-4">
        {!collapsed && (
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {role.toUpperCase()}
          </span>
        )}
        <button
          type="button"
          className="cursor-pointer rounded-md p-1 text-sm text-slate-500 hover:bg-slate-200 hover:text-slate-900"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      <div 
        className="flex-1 px-2 py-1 text-sm"
        style={collapsed ? { overflowY: 'auto', overflowX: 'visible' } : { overflow: 'hidden' }}
      >
        <nav className="space-y-1">
          {links.map((link) => {
            // For Overview (basePath), check exact match or no additional segments
            // For other links, check if pathname starts with link.href followed by / or end of string
            const isOverview = link.href === basePath;
            const active = isOverview
              ? pathname === basePath || pathname === `${basePath}/`
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <div key={link.href} className="relative group">
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors w-full relative",
                    active && "bg-[#111827] text-white shadow-sm hover:bg-[#1f2937]"
                  )}
                >
                  {collapsed ? (
                    <span className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md shadow-sm transition-colors",
                      active 
                        ? "bg-[#1f2937] text-white" 
                        : "bg-white text-slate-700"
                    )}>
                      {link.icon}
                    </span>
                  ) : (
                    <>
                      <span className={cn(
                        active ? "text-white" : "text-slate-500"
                      )}>{link.icon}</span>
                      <span>{link.label}</span>
                    </>
                  )}
                </Link>
                {collapsed && (
                  <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#111827] text-white text-xs font-semibold whitespace-nowrap opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-[99999] pointer-events-none shadow-xl">
                    {link.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-[#111827]" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 px-2 py-3 text-sm">
        <div className="relative group">
          <Link
            href={`${basePath}/settings`}
            className={cn(
              "cursor-pointer flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors",
              pathname === `${basePath}/settings` && "bg-[#111827] text-white hover:bg-[#1f2937]"
            )}
          >
            <Settings size={16} className={pathname === `${basePath}/settings` ? "text-white" : "text-slate-500"} />
            {!collapsed && <span>Settings</span>}
          </Link>
          {collapsed && (
            <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#111827] text-white text-xs font-semibold whitespace-nowrap opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-[99999] pointer-events-none shadow-xl">
              Settings
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-[#111827]" />
            </div>
          )}
        </div>
        <div className="relative group">
          <button
            type="button"
            className="cursor-pointer mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <LogOut size={16} className="text-slate-500" />
            {!collapsed && <span>Sign out</span>}
          </button>
          {collapsed && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#111827] text-white text-xs font-semibold whitespace-nowrap opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-[99999] pointer-events-none shadow-xl">
              Sign out
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-[#111827]" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}


