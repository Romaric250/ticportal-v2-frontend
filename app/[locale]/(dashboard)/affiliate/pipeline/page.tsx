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
    <div className="min-w-0 space-y-3 sm:space-y-4">
      <header>
        <h1 className="text-base font-bold text-slate-900 sm:text-lg">
          Referral Pipeline
        </h1>
        <p className="mt-0.5 text-xs text-slate-600">
          Students referred by you. All amounts in XAF.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <label className="text-xs font-medium text-slate-600">
          Filter by:
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Payment Confirmed</option>
          <option value="processing">Processing</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="min-w-0 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[420px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-2 py-1.5 font-medium text-slate-600">Student Name</th>
              <th className="px-2 py-1.5 font-medium text-slate-600">Join Date</th>
              <th className="px-2 py-1.5 font-medium text-slate-600">Payment Status</th>
              <th className="px-2 py-1.5 font-medium text-slate-600">Activation Progress</th>
              <th className="px-2 py-1.5 font-medium text-slate-600">Commission</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium text-white"
                      style={{ backgroundColor: THEME }}
                    >
                      {row.initials}
                    </div>
                    <span className="font-medium text-slate-900">{row.name}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{row.joinDate}</td>
                <td className="px-2 py-1.5">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      row.paymentStatus === "PAYMENT CONFIRMED" && "bg-emerald-100 text-emerald-700",
                      row.paymentStatus === "PROCESSING" && "bg-amber-100 text-amber-700",
                      row.paymentStatus === "PENDING" && "bg-slate-100 text-slate-600"
                    )}
                  >
                    {row.paymentStatus}
                  </span>
                </td>
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-200 sm:w-16">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${row.activationProgress}%`, backgroundColor: THEME }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-600">{row.activationLabel}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 font-medium text-slate-900">
                  {formatXAF(row.commission)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
