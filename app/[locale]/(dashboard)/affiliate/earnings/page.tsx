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
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Earnings
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Commission summary. All amounts in XAF.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${THEME}20` }}>
              <Clock size={20} style={{ color: THEME }} />
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pending</p>
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
            {formatXAF(mockEarnings.pending)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${THEME}20` }}>
              <CheckCircle size={20} style={{ color: THEME }} />
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Earned</p>
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
            {formatXAF(mockEarnings.earned)}
          </p>
        </div>
        <div className="rounded-xl border p-5 text-white shadow-sm" style={{ backgroundColor: THEME }}>
          <div className="flex items-center gap-2">
            <Wallet size={20} className="opacity-90" />
            <p className="text-xs font-medium uppercase tracking-wide text-white/80">Total Paid Out</p>
          </div>
          <p className="mt-2 text-lg font-bold sm:text-xl">
            {formatXAF(mockEarnings.totalPaidOut)}
          </p>
          <p className="mt-0.5 text-xs text-white/80">Next payout: {mockEarnings.nextPayoutDate}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Transaction history and payout details will appear here when the backend API is connected.
        </p>
      </div>
    </div>
  );
}
