import React from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import type { DashboardUser, DashboardStats } from "@/src/lib/services/dashboardService";

type Props = {
  user: DashboardUser;
  stats: DashboardStats;
};

export function StudentHeader({ user, stats }: Props) {
  const router = useRouter();
  const locale = useLocale();

  const handleResumeLearning = () => {
    router.push(`/${locale}/student/learning-path`);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Student Portal
          </p>
          <h1 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
            Welcome back, <span className="font-bold">{user.name}</span>
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            You&apos;re on a <span className="font-semibold text-slate-900">{stats.dayStreak}</span>‑day streak. Keep pushing towards your next badge!
          </p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleResumeLearning}
            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-400 transition-all"
          >
            Resume learning
          </button>
        </div>
      </div>
    </div>
  );
}


