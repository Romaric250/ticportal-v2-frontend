"use client";

import { DataTable } from "../../../../components/ui/table";
import { Skeleton } from "../../../../components/ui/loader";

export default function MentorDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-50">Mentor Dashboard</h1>
      <p className="text-xs text-slate-400">
        Scaffold for mentor overview, assigned teams, and mentorship queue.
      </p>

      <div className="grid gap-4 md:grid-cols-[1.3fr,1fr]">
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Assigned teams
          </h2>
          <DataTable
            data={[]}
            columns={[
              { key: "team", label: "Team" },
              { key: "school", label: "School" },
              { key: "stage", label: "Stage" },
            ]}
          />
        </div>
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Mentorship requests
          </h2>
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}


