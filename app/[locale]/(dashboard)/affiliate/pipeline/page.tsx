"use client";

import { useState, useEffect } from "react";
import { cn } from "@/src/utils/cn";
import { affiliateService, type Referral, type ReferralStatus } from "@/src/lib/services/affiliateService";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const THEME = "#111827";

function formatXAF(value: number): string {
  return value.toLocaleString("fr-FR") + " XAF";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getStatusColor(status: ReferralStatus): string {
  switch (status) {
    case "PAID":
    case "ACTIVATED":
      return "bg-emerald-100 text-emerald-700";
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getStatusLabel(status: ReferralStatus): string {
  switch (status) {
    case "PAID":
      return "PAYMENT CONFIRMED";
    case "PENDING":
      return "PROCESSING";
    case "ACTIVATED":
      return "ACTIVATED";
    default:
      return status;
  }
}

function getProgress(status: ReferralStatus): { progress: number; label: string } {
  switch (status) {
    case "ACTIVATED":
      return { progress: 100, label: "Activated" };
    case "PAID":
      return { progress: 75, label: "Payment Confirmed" };
    default:
      return { progress: 25, label: "Pending" };
  }
}

export default function PipelinePage() {
  const [filter, setFilter] = useState<"all" | "confirmed" | "processing" | "pending">("all");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadReferrals();
  }, [filter, page]);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const statusMap: Record<string, ReferralStatus | undefined> = {
        all: undefined,
        confirmed: "PAID",
        processing: "PENDING",
        pending: "PENDING",
      };

      const response = await affiliateService.getReferrals({
        status: statusMap[filter],
        page,
        limit: 50,
      });

      setReferrals(response.referrals);
      setTotalPages(response.pagination.pages);
      setTotal(response.pagination.total);
      setPage(response.pagination.page);
    } catch (error: any) {
      console.error("Failed to load referrals:", error);
      toast.error(error?.message || "Failed to load referrals");
    } finally {
      setLoading(false);
    }
  };

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

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200/80 bg-white">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      ) : (
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
                {referrals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                      No referrals found.
                    </td>
                  </tr>
                ) : (
                  referrals.map((referral) => {
                    const studentName = `${referral.student.firstName} ${referral.student.lastName}`;
                    const initials = getInitials(studentName);
                    const statusLabel = getStatusLabel(referral.status);
                    const statusColor = getStatusColor(referral.status);
                    const { progress, label } = getProgress(referral.status);
                    const commission = referral.commissionAmount || 0;

                    return (
                      <tr
                        key={referral.id}
                        className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/50"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                              style={{ backgroundColor: THEME }}
                            >
                              {initials}
                            </div>
                            <span className="font-medium text-slate-900">{studentName}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">
                          {formatDate(referral.registeredAt)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", statusColor)}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full transition-[width]"
                                style={{ width: `${progress}%`, backgroundColor: THEME }}
                              />
                            </div>
                            <span className="text-xs text-slate-500">{label}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-900">
                          {formatXAF(commission)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {referrals.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3">
                <p className="text-xs text-slate-500">
                  Showing {(page - 1) * 50 + 1}–{Math.min(page * 50, total)} of {total} referrals
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
