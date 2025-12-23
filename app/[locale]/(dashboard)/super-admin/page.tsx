"use client";

import { DataTable } from "../../../../components/ui/table";

export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-50">
        Super Admin Dashboard
      </h1>
      <p className="text-xs text-slate-400">
        Scaffold for multi-region oversight, national analytics, and global
        settings.
      </p>

      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Regions overview
        </h2>
        <DataTable
          data={[]}
          columns={[
            { key: "region", label: "Region" },
            { key: "schools", label: "Schools" },
            { key: "students", label: "Students" },
          ]}
        />
      </div>
    </div>
  );
}


