"use client";

import { DataTable } from "../../../../components/ui/table";

export default function JudgeDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-50">Judge Dashboard</h1>
      <p className="text-xs text-slate-400">
        Scaffold for judging queues, scoring tasks, and hackathon rounds.
      </p>

      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Pending evaluations
        </h2>
        <DataTable
          data={[]}
          columns={[
            { key: "team", label: "Team" },
            { key: "category", label: "Category" },
            { key: "round", label: "Round" },
          ]}
        />
      </div>
    </div>
  );
}


