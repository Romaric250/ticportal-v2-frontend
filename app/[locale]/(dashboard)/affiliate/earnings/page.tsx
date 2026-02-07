"use client";

import { Wallet, Clock, CheckCircle } from "lucide-react";

const THEME = "#111827";

function formatXAF(value: number): string {
  return value.toLocaleString("fr-FR") + " XAF";
}

const mockEarnings = {
  pending: 270000,
  earned: 720000,
  totalPaidOut: 2310000,
  nextPayoutDate: "Oct 15",
};

export default function EarningsPage() {
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
            {formatXAF(mockEarnings.pending)}
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
            {formatXAF(mockEarnings.earned)}
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
            {formatXAF(mockEarnings.totalPaidOut)}
          </p>
          <p className="mt-1 text-xs text-white/70">Next payout: {mockEarnings.nextPayoutDate}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Transaction history and payout details will appear here when the backend API is connected.
        </p>
      </div>
    </div>
  );
}
