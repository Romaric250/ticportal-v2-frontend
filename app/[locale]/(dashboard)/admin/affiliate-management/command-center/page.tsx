"use client";

import { useState } from "react";
import { Filter, Calendar, Shield } from "lucide-react";
import { cn } from "../../../../../../src/utils/cn";

// Format number as XAF (no symbol in design; we show "XAF" or "CFA" in labels)
function formatXAF(value: number): string {
  return value.toLocaleString("fr-FR") + " XAF";
}

// Mock data – replace with API when backend is ready
const financialOverview = [
  {
    label: "Total Revenue",
    value: 12450000,
    sub: "+12.5% vs last month",
    trend: "up" as const,
  },
  {
    label: "Commissions Owed",
    value: 1200500,
    sub: "-2.1% outstanding",
    trend: "down" as const,
  },
  {
    label: "Commissions Paid",
    value: 8400000,
    sub: "+5.4% settled",
    trend: "up" as const,
  },
  {
    label: "TIC Net Fees",
    value: 2849500,
    sub: "+8.2% platform profit",
    trend: "up" as const,
  },
];

const ledgerRows = [
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
  {
    id: "TXN-49199",
    student: "Jean-Pierre",
    payment: 5300,
    aff: null,
    reg: null,
    nat: null,
    ticNet: 0,
    status: "error" as const,
  },
  {
    id: "TXN-49198",
    student: "Fatoumata T.",
    payment: 5300,
    aff: 500,
    reg: 300,
    nat: 200,
    ticNet: 4300,
    status: "completed" as const,
  },
];

export default function CommandCenterPage() {
  const [ledgerPage, setLedgerPage] = useState(1);
  const totalLedgerPages = 245;
  const ledgerTotal = 2450;

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <header>
        <h1 className="text-lg font-bold text-slate-900 sm:text-xl lg:text-2xl">
          Financial Command Center
        </h1>
        <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
          Real-time oversight of hierarchical affiliate commissions and platform
          revenue. All amounts in XAF.
        </p>
      </header>

      {/* Financial Overview */}
      <section className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {financialOverview.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:rounded-xl sm:p-4"
          >
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
              {card.label}
            </p>
            <p className="mt-0.5 text-sm font-bold text-slate-900 sm:mt-1 sm:text-xl lg:text-2xl">
              {formatXAF(card.value)}
            </p>
            <p
              className={cn(
                "mt-0.5 text-[10px] sm:mt-1 sm:text-xs",
                card.trend === "up" ? "text-emerald-600" : "text-amber-600"
              )}
            >
              {card.sub}
            </p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        {/* System Ledger */}
        <section className="min-w-0 lg:col-span-2 lg:col-start-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
              System Ledger
            </h2>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:gap-1.5 sm:px-3 sm:py-2"
              >
                <Filter size={14} />
                <span className="hidden sm:inline">Filter</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:gap-1.5 sm:px-3 sm:py-2"
              >
                <Calendar size={14} />
                <span className="hidden sm:inline">Date range</span>
              </button>
            </div>
          </div>
          <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm sm:mt-3 sm:rounded-xl">
            <table className="w-full min-w-[520px] text-left text-xs sm:min-w-[640px] sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-2 py-2 font-medium text-slate-600 sm:px-3 sm:py-2.5">
                    Transaction / Student
                  </th>
                  <th className="px-2 py-2 font-medium text-slate-600 sm:px-3 sm:py-2.5">
                    Payment
                  </th>
                  <th className="hidden px-2 py-2 font-medium text-slate-600 sm:table-cell sm:px-3 sm:py-2.5">
                    Splits
                  </th>
                  <th className="px-2 py-2 font-medium text-slate-600 sm:px-3 sm:py-2.5">
                    TIC Net
                  </th>
                  <th className="px-2 py-2 font-medium text-slate-600 sm:px-3 sm:py-2.5">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {ledgerRows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-slate-100",
                      row.status === "error" && "bg-red-50/50"
                    )}
                  >
                    <td className="px-2 py-2 sm:px-3 sm:py-2.5">
                      <span className="font-medium text-slate-900">{row.id}</span>
                      <span className="text-slate-500">
                        {" "}
                        ({row.student})
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 font-medium text-slate-900 sm:px-3 sm:py-2.5">
                      {formatXAF(row.payment)}
                    </td>
                    <td className="hidden whitespace-nowrap px-2 py-2 text-slate-600 sm:table-cell sm:px-3 sm:py-2.5">
                      {row.aff != null
                        ? `AFF: ${row.aff}, REG: ${row.reg}, NAT: ${row.nat}`
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 font-medium text-slate-900 sm:px-3 sm:py-2.5">
                      {formatXAF(row.ticNet)}
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-2.5">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:text-xs",
                          row.status === "error"
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        )}
                      >
                        {row.status === "error" ? "Error" : "Done"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-2 py-1.5 sm:px-3 sm:py-2">
              <p className="text-[10px] text-slate-500 sm:text-xs">
                {(ledgerPage - 1) * 10 + 1}–
                {Math.min(ledgerPage * 10, ledgerTotal)} of {ledgerTotal}
              </p>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <button
                  type="button"
                  onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
                  disabled={ledgerPage <= 1}
                  className="rounded border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50 sm:px-2"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLedgerPage((p) => Math.min(totalLedgerPages, p + 1))
                  }
                  disabled={ledgerPage >= totalLedgerPages}
                  className="rounded border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50 sm:px-2"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right column: System Status only */}
        <div className="min-w-0 lg:col-span-1">
          <section className="rounded-lg border border-slate-200 bg-slate-900 p-3 text-white shadow-sm sm:rounded-xl sm:p-4">
            <div className="flex items-center gap-2">
              <Shield size={16} className="shrink-0 sm:h-[18px] sm:w-[18px]" />
              <h2 className="text-sm font-semibold sm:text-base">System Status</h2>
            </div>
            <p className="mt-1.5 text-xl font-bold text-emerald-400 sm:mt-2 sm:text-2xl">99.9%</p>
            <p className="text-[10px] text-slate-300 sm:text-xs">Ledger Integrity</p>
            <p className="mt-1.5 text-[10px] text-slate-400 sm:mt-2 sm:text-xs">
              Last automated audit: 15 minutes ago. No missing records found.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
