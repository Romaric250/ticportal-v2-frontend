import React from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { BookOpen, Sparkles } from "lucide-react";
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
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-5 py-5 shadow-sm sm:px-6 sm:py-6">
      {/* Decorative background elements */}
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-slate-900/5 blur-2xl" />
      <div className="absolute bottom-0 left-0 h-16 w-16 rounded-full bg-slate-900/5 blur-xl" />
      
      <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Student Dashboard
            </p>
          </div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Welcome back, <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{user.name}</span>
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-900/5 px-2.5 py-1">
              <Sparkles className="h-3.5 w-3.5 text-slate-900" />
              <p className="text-xs font-medium text-slate-700">
                <span className="font-bold text-slate-900">{stats.dayStreak}</span> day streak
              </p>
            </div>
            <p className="text-xs text-slate-600">
              Keep pushing towards your next achievement!
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <button
            onClick={handleResumeLearning}
            className="group flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-slate-800"
          >
            <BookOpen className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
            Resume Learning
          </button>
        </div>
      </div>
    </div>
  );
}


