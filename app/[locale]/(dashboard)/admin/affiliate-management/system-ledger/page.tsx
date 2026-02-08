"use client";

import { useState, useEffect, useRef } from "react";
import { Filter, Calendar, Loader2, X, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "../../../../../../src/utils/cn";
import { affiliateService, type LedgerEntry } from "@/src/lib/services/affiliateService";
import { toast } from "sonner";

const THEME = "#111827";

function formatXAF(value: number): string {
  return value.toLocaleString("fr-FR") + " XAF";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type StatusFilter = "all" | "completed" | "error";

export default function SystemLedgerPage() {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [allEntries, setAllEntries] = useState<LedgerEntry[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const dateFilterRef = useRef<HTMLDivElement>(null);
  const statusFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadLedger();
  }, [page, startDate, endDate]);

  useEffect(() => {
    // Filter entries by status
    if (statusFilter === "all") {
      setEntries(allEntries);
    } else {
      setEntries(allEntries.filter((entry) => entry.status === statusFilter));
    }
  }, [statusFilter, allEntries]);

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
        setShowDateFilter(false);
      }
      if (statusFilterRef.current && !statusFilterRef.current.contains(event.target as Node)) {
        setShowStatusFilter(false);
      }
    };
    if (showDateFilter || showStatusFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDateFilter, showStatusFilter]);

  const loadLedger = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 50 };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await affiliateService.getSystemLedger(params);
      setAllEntries(response.entries);
      setTotalPages(response.pagination.pages);
      setTotal(response.pagination.total);
      
      // Apply status filter
      if (statusFilter === "all") {
        setEntries(response.entries);
      } else {
        setEntries(response.entries.filter((entry) => entry.status === statusFilter));
      }
    } catch (error: any) {
      console.error("Failed to load ledger:", error);
      toast.error(error?.message || "Failed to load system ledger");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
    setPage(1);
  };

  const hasActiveFilters = startDate || endDate || statusFilter !== "all";
  const filteredTotal = statusFilter === "all" ? total : entries.length;

  return (
    <div className="min-w-0 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">System Ledger</h1>
        <p className="mt-1 text-xs text-slate-500">
          Complete transaction history with commission splits. All amounts in XAF.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <div className="relative" ref={statusFilterRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowStatusFilter(!showStatusFilter);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              statusFilter !== "all"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            )}
          >
            <Filter size={14} />
            Status
            {statusFilter !== "all" && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px]">
                1
              </span>
            )}
          </button>
          {showStatusFilter && (
            <div className="absolute left-0 top-full z-20 mt-1 w-40 rounded-lg border border-slate-200 bg-white shadow-lg">
              <div className="p-1">
                {(["all", "completed", "error"] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatusFilter(status);
                      setShowStatusFilter(false);
                    }}
                    className={cn(
                      "w-full rounded px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
                      statusFilter === status
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {status === "all" ? "All Status" : status === "completed" ? "Completed" : "Error"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Date Range Filter */}
        <div className="relative" ref={dateFilterRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDateFilter(!showDateFilter);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              startDate || endDate
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            )}
          >
            <Calendar size={14} />
            Date Range
            {(startDate || endDate) && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px]">
                1
              </span>
            )}
          </button>
          {showDateFilter && (
            <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-700">Filter by Date</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDateFilter(false);
                  }}
                  className="rounded p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      e.stopPropagation();
                      setStartDate(e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      e.stopPropagation();
                      setEndDate(e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-200"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 font-medium text-slate-600">Student</th>
                <th className="px-4 py-3 font-medium text-slate-600">Payment Amount</th>
                <th className="px-4 py-3 font-medium text-slate-600">Commission Splits</th>
                <th className="px-4 py-3 font-medium text-slate-600 text-right">TIC Net</th>
                <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Loader2 className="mx-auto animate-spin text-slate-400" size={24} />
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-xs text-slate-500">
                    No ledger entries found.
                  </td>
                </tr>
              ) : (
                entries.map((row) => {
                  const studentName = `${row.student.firstName} ${row.student.lastName}`;
                  const hasCommissions = row.affiliateCommission || row.regionalCommission || row.nationalCommission;
                  
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "transition-colors hover:bg-slate-50/50",
                        row.status === "error" && "bg-red-50/20"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{studentName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{formatXAF(row.payment.amount)}</div>
                      </td>
                      <td className="px-4 py-3">
                        {row.affiliateCommission != null && row.affiliateCommission > 0 ? (
                          <span className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-xs font-medium text-white">
                            AFF: {formatXAF(row.affiliateCommission)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-semibold text-slate-900">{formatXAF(row.ticNet)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-500">{formatDate(row.createdAt)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white",
                            row.status === "error"
                              ? "bg-red-600"
                              : "bg-slate-900"
                          )}
                        >
                          {row.status === "error" ? (
                            <>
                              <AlertCircle size={12} />
                              Error
                            </>
                          ) : (
                            <>
                              <CheckCircle size={12} />
                              Completed
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredTotal > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-500">
              Showing <span className="font-medium text-slate-700">{(page - 1) * 50 + 1}</span>–
              <span className="font-medium text-slate-700">{Math.min(page * 50, filteredTotal)}</span> of{" "}
              <span className="font-medium text-slate-700">{filteredTotal}</span> transactions
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2.5 text-xs font-medium text-slate-700">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
