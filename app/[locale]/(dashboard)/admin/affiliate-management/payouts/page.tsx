"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { affiliateService, type PayoutBatch } from "@/src/lib/services/affiliateService";
import { toast } from "sonner";

function formatXAF(value: number): string {
  return value.toLocaleString("fr-FR") + " XAF";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function PayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<PayoutBatch[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | undefined>(undefined);

  useEffect(() => {
    loadPayouts();
  }, [page, statusFilter]);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      const response = await affiliateService.getPayouts({ 
        page, 
        limit: 20,
        status: statusFilter,
      });
      setPayouts(response.payouts);
      setTotalPages(response.pagination.pages);
      setTotal(response.pagination.total);
    } catch (error: any) {
      console.error("Failed to load payouts:", error);
      toast.error(error?.message || "Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Payouts
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage affiliate and regional payouts. All amounts in XAF.
        </p>
      </header>

      {/* Status Filter */}
      <div className="flex gap-2">
        {(["all", "PENDING", "PROCESSING", "COMPLETED", "FAILED"] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status === "all" ? undefined : status)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
              (status === "all" && statusFilter === undefined) || statusFilter === status
                ? "border-slate-700 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {status === "all" ? "All" : status}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-3 py-2.5 font-medium text-slate-600">Batch Number</th>
              <th className="px-3 py-2.5 font-medium text-slate-600">
                Affiliate
              </th>
              <th className="px-3 py-2.5 font-medium text-slate-600">
                Amount (XAF)
              </th>
              <th className="px-3 py-2.5 font-medium text-slate-600">
                Commissions
              </th>
              <th className="px-3 py-2.5 font-medium text-slate-600">
                Status
              </th>
              <th className="px-3 py-2.5 font-medium text-slate-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && payouts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <Loader2 className="mx-auto animate-spin text-slate-400" size={24} />
                </td>
              </tr>
            ) : payouts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No payouts found.
                </td>
              </tr>
            ) : (
              payouts.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-3 py-2.5 font-medium text-slate-900">
                    {row.batchNumber || row.id}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">
                    <div>
                      <div className="font-medium text-slate-900">
                        {row.affiliateCode || "N/A"}
                      </div>
                      {row.affiliateName && (
                        <div className="text-xs text-slate-500">{row.affiliateName}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-slate-900">
                    {formatXAF(row.totalAmount)}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">
                    {row.commissionCount} commission{row.commissionCount !== 1 ? "s" : ""}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700"
                          : row.status === "FAILED"
                          ? "bg-red-100 text-red-700"
                          : row.status === "PROCESSING"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">
                    {formatDate(row.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {payouts.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-3 py-2">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} payouts
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
