import React from "react";

type StatCardProps = {
  title: string;
  primary: string;
  secondary: string;
};

function StatCard({ title, primary, secondary }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-sm sm:py-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <div className="mt-3 flex flex-col gap-1">
        <span className="text-xl font-bold text-slate-900 sm:text-2xl">
          {primary}
        </span>
        <span className="text-[11px] text-slate-500">{secondary}</span>
      </div>
    </div>
  );
}

function LevelProgressCard() {
  return (
    <div className="rounded-xl bg-[#111827] px-4 py-3 text-xs text-slate-50 shadow-md sm:py-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
        Level 5 progress
      </p>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <span className="text-xl font-bold text-white sm:text-2xl">85%</span>
        <span className="hidden text-[10px] text-slate-300 sm:block">
          Only 50 TP more to reach Level 5 and unlock your next badge.
        </span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
        <div className="h-full w-11/12 rounded-full bg-white" />
      </div>
    </div>
  );
}

export function StudentStatsRow() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="TIC Points (TP)"
        primary="2,450"
        secondary="+150 today"
      />
      <StatCard title="Current level" primary="Level 4" secondary="Scholar" />
      <StatCard title="Day streak" primary="12" secondary="Days" />
      <LevelProgressCard />
    </div>
  );
}


