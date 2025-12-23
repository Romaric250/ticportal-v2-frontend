"use client";

import { DataTable } from "../../../../components/ui/table";
import { Leaderboard } from "../../../../components/gamification/Leaderboard";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-50">Admin Dashboard</h1>
      <p className="text-xs text-slate-400">
        Scaffold for squads, teams, resources, and analytics.
      </p>

      <div className="grid gap-4 md:grid-cols-[1.4fr,1fr]">
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Squads
          </h2>
          <DataTable
            data={[]}
            columns={[
              { key: "name", label: "School" },
              { key: "region", label: "Region" },
              { key: "status", label: "Status" },
            ]}
          />
        </div>
        <Leaderboard title="Top schools (sample)" />
      </div>
    </div>
  );
}


