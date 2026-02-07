"use client";

import { useState } from "react";
import { Filter, Calendar } from "lucide-react";
import { cn } from "../../../../../../src/utils/cn";

function formatXAF(value: number): string {
  return value.toLocaleString("fr-FR") + " XAF";
}

const mockRows = [
  {
    id: "TXN-49202",
    student: "Amadou Diallo",
    payment: 5300,
    aff: 500,
    reg: 300,
    nat: 200,
    ticNet: 4300,
    status: "completed" as const,
  },
  {
    id: "TXN-49201",
    student: "Mariam Keita",
    payment: 5300,
    aff: 500,
    reg: 300,
    nat: 200,
    ticNet: 4300,
    status: "completed" as const,
  },
];

export default function SystemLedgerPage() {
  const [page, setPage] = useState(1);
  const totalPages = 245;
  const total = 2450;

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <header>
        <h1 className="text-lg font-bold text-slate-900 sm:text-xl lg:text-2xl">
          System Ledger
        </h1>
        <p className="mt-0.5 text-xs text-slate-600 sm:mt-1 sm:text-sm">
          Full transaction history. All amounts in XAF.
        </p>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <Filter size={14} />
            Filter
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <Calendar size={14} />
            Date range
          </button>
        </div>
      </div>
      <div className="min-w-0 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm sm:rounded-xl">
        <table className="w-full min-w-[520px] text-left text-xs sm:min-w-[640px] sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-3 py-2.5 font-medium text-slate-600">
                Transaction / Student
              </th>
              <th className="px-3 py-2.5 font-medium text-slate-600">
                Payment
              </th>
              <th className="px-3 py-2.5 font-medium text-slate-600">
                Affiliate splits
              </th>
              <th className="px-3 py-2.5 font-medium text-slate-600">
                TIC Net
              </th>
              <th className="px-3 py-2.5 font-medium text-slate-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {mockRows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-slate-100",
                  row.status === "error" && "bg-red-50/50"
                )}
              >
                <td className="px-3 py-2.5">
                  <span className="font-medium text-slate-900">{row.id}</span>
                  <span className="text-slate-500"> (Student: {row.student})</span>
                </td>
                <td className="px-3 py-2.5 font-medium text-slate-900">
                  {formatXAF(row.payment)}
                </td>
                <td className="px-3 py-2.5 text-slate-600">
                  AFF: {row.aff}, REG: {row.reg}, NAT: {row.nat}
                </td>
                <td className="px-3 py-2.5 font-medium text-slate-900">
                  {formatXAF(row.ticNet)}
                </td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Completed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-3 py-2">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of{" "}
            {total} transactions
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
      </div>
    </div>
  );
}
