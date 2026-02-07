"use client";

import { useState, useEffect } from "react";
import { Wallet, Clock, CheckCircle, Loader2 } from "lucide-react";
import { affiliateService, type AffiliateDashboard, type Commission } from "@/src/lib/services/affiliateService";
import { toast } from "sonner";

const THEME = "#111827";

function formatXAF(value: number): string {
  return value.toLocaleString("fr-FR") + " XAF";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function EarningsPage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<AffiliateDashboard | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboardData, commissionsData] = await Promise.all([
        affiliateService.getDashboard(),
        affiliateService.getCommissions({ page, limit: 20 }),
      ]);
      setDashboard(dashboardData);
      setCommissions(commissionsData.commissions);
      setTotalPages(commissionsData.pagination.pages);
      setTotal(commissionsData.pagination.total);
    } catch (error: any) {
      console.error("Failed to load earnings:", error);
      toast.error(error?.message || "Failed to load earnings data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Failed to load earnings data.</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Earnings
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Commission summary. All amounts in XAF.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
              style={{ backgroundColor: `${THEME}15` }}
            >
              <Clock size={20} style={{ color: THEME }} />
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Pending</p>
          </div>
          <p className="mt-2 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            {formatXAF(dashboard.earnings.pending)}
          </p>
        </div>
        <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
              style={{ backgroundColor: `${THEME}15` }}
            >
              <CheckCircle size={20} style={{ color: THEME }} />
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Earned</p>
          </div>
          <p className="mt-2 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            {formatXAF(dashboard.earnings.earned)}
          </p>
        </div>
        <div
          className="rounded-2xl border p-5 text-white shadow-md transition-shadow hover:shadow-lg"
          style={{ backgroundColor: THEME, borderColor: "rgba(17,24,39,0.9)" }}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Wallet size={20} className="opacity-90" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/80">Total Paid Out</p>
          </div>
          <p className="mt-2 text-lg font-bold tracking-tight sm:text-xl">
            {formatXAF(dashboard.earnings.paid)}
          </p>
          <p className="mt-1 text-xs text-white/70">Total commissions paid</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Recent Commissions</h2>
        {commissions.length === 0 ? (
          <p className="text-sm text-slate-500">No commissions yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90">
                  <th className="px-4 py-3 font-medium text-slate-600">Student</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Type</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Amount</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Earned At</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((commission) => {
                  const studentName = commission.referral
                    ? `${commission.referral.student.firstName} ${commission.referral.student.lastName}`
                    : "N/A";

                  return (
                    <tr key={commission.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{studentName}</td>
                      <td className="px-4 py-3 text-slate-600">{commission.type}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {formatXAF(commission.commissionAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            commission.status === "PAID"
                              ? "bg-emerald-100 text-emerald-700"
                              : commission.status === "APPROVED"
                              ? "bg-blue-100 text-blue-700"
                              : commission.status === "EARNED"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {commission.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(commission.earnedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {commissions.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3">
                <p className="text-xs text-slate-500">
                  Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} commissions
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
        )}
      </div>
    </div>
  );
}
