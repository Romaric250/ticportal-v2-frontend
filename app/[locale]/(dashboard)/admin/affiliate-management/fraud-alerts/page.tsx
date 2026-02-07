"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { affiliateService, type FraudFlag } from "@/src/lib/services/affiliateService";
import { toast } from "sonner";

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function FraudAlertsPage() {
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<FraudFlag[]>([]);
  const [filterResolved, setFilterResolved] = useState<boolean | undefined>(false);

  useEffect(() => {
    loadFlags();
  }, [filterResolved]);

  const loadFlags = async () => {
    try {
      setLoading(true);
      const response = await affiliateService.getFraudFlags({
        resolved: filterResolved,
        limit: 50,
      });
      setFlags(response.flags);
    } catch (error: any) {
      console.error("Failed to load fraud flags:", error);
      toast.error(error?.message || "Failed to load fraud alerts");
    } finally {
      setLoading(false);
    }
  };

  const criticalCount = flags.filter((f) => f.severity === "CRITICAL" && !f.resolved).length;

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-bold text-slate-900 sm:text-xl lg:text-2xl">
            Fraud & Alerts
          </h1>
          {criticalCount > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              {criticalCount} CRITICAL
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-600 sm:mt-1 sm:text-sm">
          Review and act on fraud and commission alerts.
        </p>
      </header>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setFilterResolved(undefined)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
            filterResolved === undefined
              ? "border-slate-700 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilterResolved(false)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
            filterResolved === false
              ? "border-slate-700 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => setFilterResolved(true)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
            filterResolved === true
              ? "border-slate-700 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Resolved
        </button>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-slate-400" size={32} />
          </div>
        ) : flags.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">No fraud alerts found.</p>
          </div>
        ) : (
          flags.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border bg-white p-3 shadow-sm sm:rounded-xl sm:p-4 ${
                alert.severity === "WARNING"
                  ? "border-amber-300 bg-amber-50/30"
                  : alert.severity === "CRITICAL"
                  ? "border-red-300 bg-red-50/30"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">{alert.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatTimeAgo(alert.createdAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    alert.severity === "CRITICAL"
                      ? "bg-red-100 text-red-700"
                      : alert.severity === "WARNING"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {alert.severity}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{alert.description}</p>
              {alert.affiliateId && (
                <button
                  type="button"
                  className="mt-3 flex items-center gap-1 text-sm font-medium text-slate-700 hover:underline"
                >
                  View Affiliate
                  <ExternalLink size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
