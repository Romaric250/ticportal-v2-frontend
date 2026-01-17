import React from "react";
import type { DashboardStats } from "@/src/lib/services/dashboardService";

type StatCardProps = {
  title: string;
  primary: string;
  secondary: string;
};

function StatCard({ title, primary, secondary }: StatCardProps) {
  return (
    <div className="group rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm shadow-sm transition-all hover:shadow-md hover:border-slate-300 sm:py-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <div className="mt-3 flex flex-col gap-1">
        <span className="text-xl font-bold text-slate-900 sm:text-2xl">
          {primary}
        </span>
        <span className="text-xs text-slate-500">{secondary}</span>
      </div>
    </div>
  );
}

type LevelProgressCardProps = {
  progress: DashboardStats["levelProgress"];
};

function LevelProgressCard({ progress }: LevelProgressCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm shadow-sm sm:py-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {progress.nextLevelName} progress
      </p>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <span className="text-xl font-bold text-slate-900 sm:text-2xl">{progress.percentage}%</span>
        <span className="hidden text-xs text-slate-500 sm:block">
          Only {progress.pointsNeeded} TP more to reach {progress.nextLevelName} and unlock your next badge.
        </span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-700 transition-all"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </div>
  );
}

type Props = {
  stats: DashboardStats;
};

export function StudentStatsRow({ stats }: Props) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="TIC Points (TP)"
        primary={formatNumber(stats.totalTP)}
        secondary={stats.tpToday > 0 ? `+${formatNumber(stats.tpToday)} today` : "No points today"}
      />
      <StatCard
        title="Current level"
        primary={`Level ${stats.currentLevel}`}
        secondary={stats.levelName}
      />
      <StatCard
        title="Day streak"
        primary={stats.dayStreak.toString()}
        secondary={stats.dayStreak === 1 ? "Day" : "Days"}
      />
      <LevelProgressCard progress={stats.levelProgress} />
    </div>
  );
}


