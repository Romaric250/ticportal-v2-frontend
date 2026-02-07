"use client";

import { useState } from "react";
import { cn } from "@/src/utils/cn";

const THEME = "#111827";

function formatXAF(value: number): string {
  return value.toLocaleString("fr-FR") + " XAF";
}

const mockPipeline = [
  { id: "1", name: "Jordan Davis", initials: "JD", joinDate: "Oct 12, 2023", paymentStatus: "PAYMENT CONFIRMED" as const, activationProgress: 100, activationLabel: "Task Completed", commission: 15000 },
  { id: "2", name: "Sarah Kim", initials: "SK", joinDate: "Oct 11, 2023", paymentStatus: "PROCESSING" as const, activationProgress: 60, activationLabel: "Profile Setup", commission: 0 },
  { id: "3", name: "Marcus Reed", initials: "MR", joinDate: "Oct 10, 2023", paymentStatus: "PAYMENT CONFIRMED" as const, activationProgress: 75, activationLabel: "Course Started", commission: 15000 },
  { id: "4", name: "Alex Chen", initials: "AC", joinDate: "Oct 9, 2023", paymentStatus: "PENDING" as const, activationProgress: 25, activationLabel: "Signed up", commission: 0 },
];

export default function PipelinePage() {
  const [filter, setFilter] = useState<"all" | "confirmed" | "processing" | "pending">("all");

  const filtered = mockPipeline.filter((row) => {
    if (filter === "all") return true;
    if (filter === "confirmed") return row.paymentStatus === "PAYMENT CONFIRMED";
    if (filter === "processing") return row.paymentStatus === "PROCESSING";
    if (filter === "pending") return row.paymentStatus === "PENDING";
    return true;
  });

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Referral Pipeline
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Students referred by you. All amounts in XAF.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="text-sm font-medium text-slate-600">
          Filter by status
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-700 transition-colors focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Payment Confirmed</option>
          <option value="processing">Processing</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90">
                <th className="px-4 py-3.5 font-medium text-slate-600">Student Name</th>
                <th className="px-4 py-3.5 font-medium text-slate-600">Join Date</th>
                <th className="px-4 py-3.5 font-medium text-slate-600">Payment Status</th>
                <th className="px-4 py-3.5 font-medium text-slate-600">Activation Progress</th>
                <th className="px-4 py-3.5 font-medium text-slate-600">Commission</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: THEME }}
                      >
                        {row.initials}
                      </div>
                      <span className="font-medium text-slate-900">{row.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">{row.joinDate}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        row.paymentStatus === "PAYMENT CONFIRMED" && "bg-emerald-100 text-emerald-700",
                        row.paymentStatus === "PROCESSING" && "bg-amber-100 text-amber-700",
                        row.paymentStatus === "PENDING" && "bg-slate-100 text-slate-600"
                      )}
                    >
                      {row.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full transition-[width]"
                          style={{ width: `${row.activationProgress}%`, backgroundColor: THEME }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{row.activationLabel}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-900">
                    {formatXAF(row.commission)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
