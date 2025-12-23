"use client";

import { BadgePoints } from "../../../../components/gamification/BadgePoints";
import { Leaderboard } from "../../../../components/gamification/Leaderboard";
import { DataTable } from "../../../../components/ui/table";
import { Skeleton } from "../../../../components/ui/loader";

export default function StudentDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-50">
        Student Dashboard
      </h1>
      <p className="text-xs text-slate-400">
        This is a scaffold. Plug in learning stages, tasks, and hackathons here.
      </p>

      <div className="grid gap-4 md:grid-cols-[1.5fr,1fr]">
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Upcoming milestones
          </h2>
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-3">
          <BadgePoints badgesCount={3} points={240} />
          <Leaderboard title="Student leaderboard (sample)" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Recent assignments
        </h2>
        <DataTable
          data={[]}
          columns={[
            { key: "title", label: "Title" },
            { key: "stage", label: "Stage" },
            { key: "status", label: "Status" },
          ]}
        />
      </div>
    </div>
  );
}


