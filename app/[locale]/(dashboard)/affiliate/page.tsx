"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Download,
  Wallet,
  Clock,
  CheckCircle,
  Copy,
  Link2,
  QrCode,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/src/utils/cn";

// Theme: #111827 (slate-900) for primary actions and accents
const THEME = "#111827";

function formatXAF(value: number): string {
  return value.toLocaleString("fr-FR") + " XAF";
}

// Mock – replace with API
const mockMetrics = {
  pendingCommission: 270000,
  pendingChange: 12,
  earnedCommission: 720000,
  earnedChange: 5,
  activeReferrals: 84,
  totalPaidOut: 2310000,
  nextPayoutDate: "Oct 15",
};

const mockReferralLink = "https://portal.ticsummit.org/ref/campus-rep-alex";

const mockPipeline = [
  {
    id: "1",
    name: "Jordan Davis",
    initials: "JD",
    joinDate: "Oct 12, 2023",
    paymentStatus: "PAYMENT CONFIRMED" as const,
    activationProgress: 100,
    activationLabel: "Task Completed",
    commission: 15000,
  },
  {
    id: "2",
    name: "Sarah Kim",
    initials: "SK",
    joinDate: "Oct 11, 2023",
    paymentStatus: "PROCESSING" as const,
    activationProgress: 60,
    activationLabel: "Profile Setup",
    commission: 0,
  },
  {
    id: "3",
    name: "Marcus Reed",
    initials: "MR",
    joinDate: "Oct 10, 2023",
    paymentStatus: "PAYMENT CONFIRMED" as const,
    activationProgress: 75,
    activationLabel: "Course Started",
    commission: 15000,
  },
];

function WithdrawFundsModal({
  open,
  onClose,
  availableBalance,
}: {
  open: boolean;
  onClose: () => void;
  availableBalance: number;
}) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount.replace(/\s/g, ""));
    if (Number.isNaN(num) || num <= 0 || num > availableBalance) return;
    setSubmitting(true);
    // TODO: API call
    setTimeout(() => {
      setSubmitting(false);
      setAmount("");
      onClose();
    }, 800);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" aria-hidden onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdraw-modal-title"
      >
        <div className="flex items-center justify-between">
          <h2 id="withdraw-modal-title" className="text-lg font-semibold text-slate-900">
            Withdraw Funds
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Available balance: {formatXAF(availableBalance)}
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="withdraw-amount" className="block text-sm font-medium text-slate-700">
              Amount (XAF)
            </label>
            <input
              id="withdraw-amount"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
              style={{ backgroundColor: THEME }}
            >
              {submitting ? "Processing…" : "Confirm Withdrawal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AffiliateDashboardPage() {
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const copyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(mockReferralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <WithdrawFundsModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        availableBalance={mockMetrics.earnedCommission}
      />
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Affiliate Performance
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track your student acquisitions and real-time earnings. All amounts in XAF.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setWithdrawOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-95"
          style={{ backgroundColor: THEME }}
        >
          <Wallet size={18} />
          Withdraw Funds
        </button>
      </div>

      {/* Metric cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Pending Commission
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                {formatXAF(mockMetrics.pendingCommission)}
              </p>
              <p className="mt-0.5 text-xs text-emerald-600">
                +{mockMetrics.pendingChange}% from last month
              </p>
            </div>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full opacity-90"
              style={{ backgroundColor: `${THEME}20` }}
            >
              <Clock size={20} style={{ color: THEME }} />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Earned Commission
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                {formatXAF(mockMetrics.earnedCommission)}
              </p>
              <p className="mt-0.5 text-xs text-emerald-600">
                +{mockMetrics.earnedChange}% {mockMetrics.activeReferrals} active referrals
              </p>
            </div>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full opacity-90"
              style={{ backgroundColor: `${THEME}20` }}
            >
              <CheckCircle size={20} style={{ color: THEME }} />
            </div>
          </div>
        </div>
        <div
          className="rounded-xl border p-5 text-white shadow-sm"
          style={{ backgroundColor: THEME, borderColor: THEME }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-white/80">
                Total Paid Out
              </p>
              <p className="mt-1 text-lg font-bold sm:text-xl">
                {formatXAF(mockMetrics.totalPaidOut)}
              </p>
              <p className="mt-0.5 text-xs text-white/80">
                Next payout: {mockMetrics.nextPayoutDate}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
              <Wallet size={20} />
            </div>
          </div>
        </div>
      </section>

      {/* Referral Toolkit */}
      <section>
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
          Referral Toolkit
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Your Unique Referral Link
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span
                className="truncate text-sm font-medium"
                style={{ color: THEME }}
              >
                {mockReferralLink}
              </span>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: THEME }}
                >
                  <Copy size={16} />
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <Link
                  href={`/${locale}/affiliate/referral-toolkit`}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Link2 size={16} />
                  Create new link
                </Link>
              </div>
            </div>
            <p className="mt-2 text-xs text-amber-600">
              Creating a new link invalidates your previous referral link.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Download QR Code
            </p>
            <p className="mt-0.5 text-xs text-slate-600">For physical posters</p>
            <div className="mt-3 flex h-20 w-20 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
              <QrCode size={32} className="text-slate-400" />
            </div>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      </section>

      {/* Referral Pipeline */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
            Referral Pipeline
          </h2>
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
            defaultValue="all"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Payment Confirmed</option>
            <option value="processing">Processing</option>
          </select>
        </div>
        <div className="mt-3 min-w-0 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-3 font-medium text-slate-600">Student Name</th>
                <th className="px-4 py-3 font-medium text-slate-600">Join Date</th>
                <th className="px-4 py-3 font-medium text-slate-600">Payment Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Activation Progress</th>
                <th className="px-4 py-3 font-medium text-slate-600">Commission</th>
              </tr>
            </thead>
            <tbody>
              {mockPipeline.map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: THEME }}
                      >
                        {row.initials}
                      </div>
                      <span className="font-medium text-slate-900">{row.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.joinDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        row.paymentStatus === "PAYMENT CONFIRMED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      )}
                    >
                      {row.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-200 sm:w-20">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${row.activationProgress}%`, backgroundColor: THEME }}
                        />
                      </div>
                      <span className="text-xs text-slate-600">{row.activationLabel}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                    {formatXAF(row.commission)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link
          href={`/${locale}/affiliate/pipeline`}
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium"
          style={{ color: THEME }}
        >
          View Full Pipeline
          <ChevronRight size={18} />
        </Link>
      </section>
    </div>
  );
}