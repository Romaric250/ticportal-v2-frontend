"use client";

import { ExternalLink } from "lucide-react";

const mockAlerts = [
  {
    id: "1",
    title: "High-Velocity Signup",
    time: "2m ago",
    description:
      'Affiliate "AF-8829" detected 50+ signups from the same IP range in 5 minutes.',
    action: "Investigate Affiliate",
    variant: "critical" as const,
  },
  {
    id: "2",
    title: "Tier Discrepancy",
    time: "1h ago",
    description:
      "Regional commission paid for TXN-49195 exceeds student net fee after deductions.",
    action: "Review Calculation",
    variant: "warning" as const,
  },
  {
    id: "3",
    title: "Chargeback Risk",
    time: "3h ago",
    description:
      "Multiple failed payment attempts for card ending in *9902 across 3 accounts.",
    action: "Block Card",
    variant: "critical" as const,
  },
];

export default function FraudAlertsPage() {
  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-bold text-slate-900 sm:text-xl lg:text-2xl">
            Fraud & Alerts
          </h1>
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            CRITICAL
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-600 sm:mt-1 sm:text-sm">
          Review and act on fraud and commission alerts.
        </p>
      </header>
      <div className="space-y-2 sm:space-y-3">
        {mockAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg border bg-white p-3 shadow-sm sm:rounded-xl sm:p-4 ${
              alert.variant === "warning"
                ? "border-amber-300 bg-amber-50/30"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-slate-900">{alert.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{alert.time}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600">{alert.description}</p>
            <button
              type="button"
              className="mt-3 flex items-center gap-1 text-sm font-medium text-slate-700 hover:underline"
            >
              {alert.action}
              <ExternalLink size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
