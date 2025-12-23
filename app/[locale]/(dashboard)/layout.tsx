"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "../../../components/layout/Sidebar";
import { TopNav } from "../../../components/layout/TopNav";

type Props = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const role = (segments[2] ?? "student") as
    | "student"
    | "mentor"
    | "judge"
    | "admin"
    | "super-admin";

  return (
    <div className="flex h-screen overflow-hidden bg-white text-slate-900">
      <Sidebar role={role} />
      <div className="flex h-screen flex-1 flex-col">
        <TopNav />
        <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
      </div>
    </div>
  );
}


