"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../src/utils/cn";

type SidebarLink = {
  href: string;
  label: string;
};

type Props = {
  role: "student" | "mentor" | "judge" | "admin" | "super-admin";
};

export function Sidebar({ role }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const basePath = `/${pathname.split("/")[1]}/${role}`;

  const links: SidebarLink[] = [
    { href: `${basePath}`, label: "Overview" },
    { href: `${basePath}/tasks`, label: "Tasks" },
    { href: `${basePath}/hackathons`, label: "Hackathons" },
  ];

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-slate-800 bg-slate-950/80 transition-all",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between px-3 py-3">
        {!collapsed && (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {role.toUpperCase()}
          </span>
        )}
        <button
          type="button"
          className="rounded-md p-1 text-xs text-slate-500 hover:bg-slate-900 hover:text-slate-100"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-1 text-xs">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-slate-300 hover:bg-slate-900 hover:text-slate-50",
                active && "bg-[#111827] text-white"
              )}
            >
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}


