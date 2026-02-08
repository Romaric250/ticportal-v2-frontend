"use client";

import { Calendar, Radio, Trophy, Video } from "lucide-react";
import type { Team } from "../../../src/lib/services/teamService";

type Props = {
  team: Team;
};

export function TeamMetrics({ team }: Props) {
  // TODO: Integrate with actual metrics API when available
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={<Calendar className="h-5 w-5 text-white" />}
        label="Submission Due"
        value="12 Days"
        bgColor="bg-gradient-to-br from-slate-900 to-slate-700"
      />
      <MetricCard
        icon={<Radio className="h-5 w-5 text-white" />}
        label="Mentor Sessions"
        value="3 / 5 Used"
        bgColor="bg-gradient-to-br from-slate-900 to-slate-700"
      />
      <MetricCard
        icon={<Trophy className="h-5 w-5 text-white" />}
        label="Team Score"
        value="850 pts"
        bgColor="bg-gradient-to-br from-slate-900 to-slate-700"
      />
      <MetricCard
        icon={<Video className="h-5 w-5 text-white" />}
        label="Next Sync"
        value="4:00 PM"
        bgColor="bg-gradient-to-br from-slate-900 to-slate-700"
      />
    </div>
  );
}

type MetricCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor?: string;
};

function MetricCard({ icon, label, value, bgColor = "bg-slate-900" }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1.5 text-lg font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bgColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

