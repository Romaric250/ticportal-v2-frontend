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
    <div className="flex min-h-[calc(100vh-3rem)] flex-col bg-slate-950 text-slate-50">
      <TopNav />
      <div className="flex flex-1">
        <Sidebar role={role} />
        <main className="flex-1 overflow-y-auto bg-slate-950 px-6 py-4">
          {children}
        </main>
      </div>
    </div>
  );
}


