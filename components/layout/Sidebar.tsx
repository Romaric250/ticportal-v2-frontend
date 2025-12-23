"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiActivity, FiCheckSquare, FiFlag } from "react-icons/fi";
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
    { href: `${basePath}`, label: "Overview", icon: <FiHome size={16} /> },
    { href: `${basePath}/scroll`, label: "Scroll", icon: <FiActivity size={16} /> },
    { href: `${basePath}/tasks`, label: "Tasks", icon: <FiCheckSquare size={16} /> },
    { href: `${basePath}/hackathons`, label: "Hackathons", icon: <FiFlag size={16} /> },
  ];

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-slate-200 bg-slate-50 transition-all",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between px-3 py-4">
        {!collapsed && (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {role.toUpperCase()}
          </span>
        )}
        <button
          type="button"
          className="rounded-md p-1 text-xs text-slate-500 hover:bg-slate-200 hover:text-slate-900"
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
    </aside>
  );
}


