"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, CheckSquare, Flag, User, BookOpen, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../src/utils/cn";

type SidebarLink = {
  href: string;
  label: string;
  icon: JSX.Element;
};

type Props = {
  role: "student" | "mentor" | "judge" | "admin" | "super-admin";
};

export function Sidebar({ role }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const basePath = `/${pathname.split("/")[1]}/${role}`;

  const links: SidebarLink[] = [
    { href: `${basePath}`, label: "Overview", icon: <Home size={16} /> },
    { href: `${basePath}/scroll`, label: "Scroll", icon: <Activity size={16} /> },
    ...(role === "student"
      ? [
          { href: `${basePath}/learning-path`, label: "Learning Path", icon: <BookOpen size={16} /> },
          { href: `${basePath}/portfolio`, label: "Portfolio", icon: <User size={16} /> },
        ]
      : []),
    { href: `${basePath}/tasks`, label: "Tasks", icon: <CheckSquare size={16} /> },
    { href: `${basePath}/hackathons`, label: "Hackathons", icon: <Flag size={16} /> },
  ];

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-slate-200 bg-slate-50 transition-all overflow-hidden",
        collapsed ? "w-16" : "w-64"
      )}
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
      <div className="flex-1 px-2 py-1 text-sm">
        <nav className="space-y-1">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-slate-600 hover:bg-white hover:text-slate-900",
                  active && "bg-white text-[#111827] shadow-sm"
                )}
              >
                {collapsed ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm">
                    {link.icon}
                  </span>
                ) : (
                  <>
                    <span className="text-slate-500">{link.icon}</span>
                    <span>{link.label}</span>
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 px-2 py-3 text-sm">
        <button
          type="button"
          className="cursor-pointer flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-slate-600 hover:bg-white hover:text-slate-900"
        >
          <Settings size={16} className="text-slate-500" />
          {!collapsed && <span>Settings</span>}
        </button>
        <button
          type="button"
          className="cursor-pointer mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-slate-600 hover:bg-white hover:text-slate-900"
        >
          <LogOut size={16} className="text-slate-500" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}


