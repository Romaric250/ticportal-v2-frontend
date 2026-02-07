"use client";

import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { cn } from "@/src/utils/cn";
import { affiliateService, type AffiliateDashboard, type Referral } from "@/src/lib/services/affiliateService";
import { toast } from "sonner";

// Theme: #111827 (slate-900) for primary actions and accents
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

function getStatusColor(status: string): string {
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

function getStatusLabel(status: string): string {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount.replace(/\s/g, ""));
    if (Number.isNaN(num) || num <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (num > availableBalance) {
      toast.error("Amount exceeds available balance");
      return;
    }
    setSubmitting(true);
    try {
      // Note: Withdrawal/payout request endpoint may need to be implemented in backend
      // For now, this is a placeholder that shows the UI is ready
      toast.info("Withdrawal request feature coming soon. Contact admin for payouts.");
      setAmount("");
      onClose();
    } catch (error: any) {
      console.error("Failed to request withdrawal:", error);
      toast.error(error?.message || "Failed to process withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl ring-1 ring-slate-900/5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdraw-modal-title"
      >
        <div className="flex items-center justify-between">
          <h2 id="withdraw-modal-title" className="text-lg font-semibold tracking-tight text-slate-900">
            Withdraw Funds
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <p className="mt-1.5 text-sm text-slate-500">
          Available balance: <span className="font-medium text-slate-700">{formatXAF(availableBalance)}</span>
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-70"
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
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<AffiliateDashboard | null>(null);
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashboardData, profile] = await Promise.all([
        affiliateService.getDashboard(),
        affiliateService.getProfile(),
      ]);
      setDashboard(dashboardData);
      setReferralLink(profile.referralLink);
    } catch (error: any) {
      console.error("Failed to load dashboard:", error);
      toast.error(error?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (typeof navigator !== "undefined" && referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
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
        <p className="text-sm text-slate-500">Failed to load dashboard data.</p>
      </div>
    );
  }

  const metrics = {
    pendingCommission: dashboard.earnings.pending,
    earnedCommission: dashboard.earnings.earned,
    activeReferrals: dashboard.stats.activeReferrals,
    totalPaidOut: dashboard.earnings.paid,
  };

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <WithdrawFundsModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        availableBalance={metrics.earnedCommission}
      />
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Affiliate Performance
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Track your student acquisitions and real-time earnings. All amounts in XAF.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setWithdrawOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-slate-900/20 transition-all hover:opacity-95 hover:shadow-xl hover:shadow-slate-900/25"
          style={{ backgroundColor: THEME }}
        >
          <Wallet size={18} />
          Withdraw Funds
        </button>
      </div>

      {/* Metric cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Pending Commission
              </p>
              <p className="mt-2 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                {formatXAF(metrics.pendingCommission)}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Awaiting approval
              </p>
            </div>
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
              style={{ backgroundColor: `${THEME}15` }}
            >
              <Clock size={20} style={{ color: THEME }} />
            </div>
          </div>
        </div>
        <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Earned Commission
              </p>
              <p className="mt-2 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                {formatXAF(metrics.earnedCommission)}
              </p>
              <p className="mt-1 text-xs font-medium text-emerald-600">
                {metrics.activeReferrals} active referrals
              </p>
            </div>
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
              style={{ backgroundColor: `${THEME}15` }}
            >
              <CheckCircle size={20} style={{ color: THEME }} />
            </div>
          </div>
        </div>
        <div
          className="rounded-2xl border p-5 text-white shadow-md transition-shadow hover:shadow-lg"
          style={{ backgroundColor: THEME, borderColor: "rgba(17,24,39,0.9)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/80">
                Total Paid Out
              </p>
              <p className="mt-2 text-lg font-bold tracking-tight sm:text-xl">
                {formatXAF(metrics.totalPaidOut)}
              </p>
              <p className="mt-1 text-xs text-white/70">
                Total commissions paid
              </p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Wallet size={20} />
            </div>
          </div>
        </div>
      </section>

      {/* Referral Toolkit */}
      <section>
        <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
          Referral Toolkit
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Your Unique Referral Link
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5">
                <span className="truncate text-sm font-medium" style={{ color: THEME }}>
                  {referralLink || "Loading..."}
                </span>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: THEME }}
                >
                  <Copy size={16} />
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <Link
                  href={`/${locale}/affiliate/referral-toolkit`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Link2 size={16} />
                  Create new link
                </Link>
              </div>
            </div>
            <p className="mt-3 text-xs text-amber-600/90">
              Creating a new link invalidates your previous referral link.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Download QR Code
            </p>
            <p className="mt-0.5 text-xs text-slate-500">For physical posters</p>
            <div className="mt-4 flex h-24 w-24 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80">
              <QrCode size={40} className="text-slate-400" />
            </div>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      </section>

      {/* Referral Pipeline */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
            Referral Pipeline
          </h2>
          <select
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-700 transition-colors focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
            defaultValue="all"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Payment Confirmed</option>
            <option value="processing">Processing</option>
          </select>
        </div>
        <div className="mt-4 min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
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
                {dashboard.recentReferrals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                      No referrals yet. Start sharing your referral link!
                    </td>
                  </tr>
                ) : (
                  dashboard.recentReferrals.map((referral) => {
                    const studentName = referral.studentName;
                    const initials = getInitials(studentName);
                    const statusLabel = getStatusLabel(referral.status);
                    const statusColor = getStatusColor(referral.status);
                    const progress = referral.status === "ACTIVATED" ? 100 : referral.status === "PAID" ? 75 : 25;
                    const progressLabel = referral.status === "ACTIVATED" ? "Activated" : referral.status === "PAID" ? "Payment Confirmed" : "Pending";

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
                            <span className="text-xs text-slate-500">{progressLabel}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-900">
                          {formatXAF(referral.commissionAmount)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Link
          href={`/${locale}/affiliate/pipeline`}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-90"
          style={{ color: THEME }}
        >
          View Full Pipeline
          <ChevronRight size={18} />
        </Link>
      </section>
    </div>
  );
}