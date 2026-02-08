import React from "react";
import { Trophy, TrendingUp, Flame, Target } from "lucide-react";
import type { DashboardStats } from "@/src/lib/services/dashboardService";

type StatCardProps = {
  title: string;
  primary: string;
  secondary: string;
  icon: React.ReactNode;
  bgColor?: string;
};

function StatCard({ title, primary, secondary, icon, bgColor = "bg-slate-900" }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <div className="mt-2.5 flex flex-col gap-0.5">
            <span className="text-xl font-bold text-slate-900 sm:text-2xl">
              {primary}
            </span>
            <span className="text-[11px] text-slate-500">{secondary}</span>
          </div>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bgColor} transition-transform group-hover:scale-110`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

type LevelProgressCardProps = {
  progress: DashboardStats["levelProgress"];
};

function LevelProgressCard({ progress }: LevelProgressCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {progress.nextLevelName} Progress
          </p>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 sm:text-2xl">{progress.percentage}%</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {progress.pointsNeeded} TP more to reach {progress.nextLevelName}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 transition-transform group-hover:scale-110">
          <Target className="h-4 w-4 text-white" />
        </div>
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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="TIC Points"
        primary={formatNumber(stats.totalTP)}
        secondary={stats.tpToday > 0 ? `+${formatNumber(stats.tpToday)} today` : "No points today"}
        icon={<Trophy className="h-4 w-4 text-white" />}
      />
      <StatCard
        title="Current Level"
        primary={`Level ${stats.currentLevel}`}
        secondary={stats.levelName}
        icon={<TrendingUp className="h-4 w-4 text-white" />}
      />
      <StatCard
        title="Day Streak"
        primary={stats.dayStreak.toString()}
        secondary={stats.dayStreak === 1 ? "Day" : "Days"}
        icon={<Flame className="h-4 w-4 text-white" />}
      />
      <LevelProgressCard progress={stats.levelProgress} />
    </div>
  );
}


