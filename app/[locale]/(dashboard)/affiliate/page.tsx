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
      return "bg-slate-100 text-slate-700";
    case "PENDING":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "PAID":
      return "Confirmed";
    case "PENDING":
      return "Processing";
    case "ACTIVATED":
      return "Activated";
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
  const [commissionRate, setCommissionRate] = useState<number | null>(null);

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
      setCommissionRate(profile.commissionRate || null);
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
    <div className="min-w-0 space-y-4">
      <WithdrawFundsModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        availableBalance={metrics.earnedCommission}
      />
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Affiliate Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Track your referrals and earnings. All amounts in XAF.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setWithdrawOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90 w-full sm:w-auto"
          style={{ backgroundColor: THEME }}
        >
          <Wallet size={16} />
          <span className="whitespace-nowrap">Withdraw</span>
        </button>
      </div>

      {/* Commission Rate Card */}
      {commissionRate !== null && (
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-600">Commission Rate</p>
              <p className="mt-1 text-base font-bold text-slate-900">
                {(commissionRate * 100).toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg bg-slate-900 px-2.5 py-1">
              <span className="text-xs font-semibold text-white">{dashboard?.profile?.tier || "STANDARD"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Metric cards */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-600">
                Pending Commission
              </p>
              <p className="mt-1.5 text-xl font-bold text-slate-900">
                {formatXAF(metrics.pendingCommission)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Awaiting approval
              </p>
            </div>
            <div
              className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${THEME}10` }}
            >
              <Clock size={18} style={{ color: THEME }} />
            </div>
          </div>
        </div>
        <div className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-600">
                Earned Commission
              </p>
              <p className="mt-1.5 text-xl font-bold text-slate-900">
                {formatXAF(metrics.earnedCommission)}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {metrics.activeReferrals} active {metrics.activeReferrals === 1 ? "referral" : "referrals"}
              </p>
            </div>
            <div
              className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${THEME}10` }}
            >
              <CheckCircle size={18} style={{ color: THEME }} />
            </div>
          </div>
        </div>
        <div
          className="rounded-xl border p-4 text-white shadow-sm transition-shadow hover:shadow"
          style={{ backgroundColor: THEME, borderColor: "rgba(17,24,39,0.9)" }}
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white/80">
                Total Paid Out
              </p>
              <p className="mt-1.5 text-xl font-bold">
                {formatXAF(metrics.totalPaidOut)}
              </p>
              <p className="mt-1 text-xs text-white/70">
                Total commissions paid
              </p>
            </div>
            <div className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <Wallet size={18} />
            </div>
          </div>
        </div>
      </section>

      {/* Referral Toolkit */}
      <section>
        <h2 className="text-base font-semibold text-slate-900">
          Referral Toolkit
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow">
            <p className="text-xs font-medium text-slate-600">
              Your Unique Referral Link
            </p>
            <div className="mt-2.5 space-y-2.5">
              <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="break-all text-xs font-medium leading-relaxed text-slate-900">
                  {referralLink || "Loading..."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: THEME }}
                >
                  <Copy size={14} />
                  <span className="whitespace-nowrap">{copied ? "Copied!" : "Copy"}</span>
                </button>
                <Link
                  href={`/${locale}/affiliate/referral-toolkit`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Link2 size={14} />
                  <span className="whitespace-nowrap">Manage</span>
                </Link>
              </div>
            </div>
            <p className="mt-2 text-xs text-amber-600">
              Creating a new link invalidates your previous referral link.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow">
            <p className="text-xs font-medium text-slate-600">
              Download QR Code
            </p>
            <p className="mt-0.5 text-xs text-slate-500">For physical posters</p>
            <div className="mt-3 flex h-20 w-20 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
              <QrCode size={32} className="text-slate-400" />
            </div>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Download size={14} />
              Download
            </button>
          </div>
        </div>
      </section>

      {/* Referral Pipeline */}
      <section>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Recent Referrals
          </h2>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition-colors focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-200 sm:w-auto"
            defaultValue="all"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Payment Confirmed</option>
            <option value="processing">Processing</option>
          </select>
        </div>
        <div className="mt-3 min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-2.5 font-medium text-slate-600">Student</th>
                  <th className="px-3 py-2.5 font-medium text-slate-600">Date</th>
                  <th className="px-3 py-2.5 font-medium text-slate-600">Status</th>
                  <th className="px-3 py-2.5 font-medium text-slate-600">Progress</th>
                  <th className="px-3 py-2.5 font-medium text-slate-600 text-right">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboard.recentReferrals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-xs text-slate-500">
                      No referrals yet. Start sharing your referral link!
                    </td>
                  </tr>
                ) : (
                  dashboard.recentReferrals.map((referral) => {
                    const studentName = referral.studentName;
                    const initials = getInitials(studentName);
                    const statusLabel = getStatusLabel(referral.status);
                    const statusColor = getStatusColor(referral.status);
                    const progress = referral.status === "ACTIVATED" || referral.status === "PAID" ? 100 : 25;
                    const progressLabel = referral.status === "ACTIVATED" ? "Activated" : referral.status === "PAID" ? "Confirmed" : "Pending";

                    return (
                      <tr
                        key={referral.id}
                        className="transition-colors hover:bg-slate-50/50"
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                              style={{ backgroundColor: THEME }}
                            >
                              {initials}
                            </div>
                            <span className="font-medium text-slate-900 truncate max-w-[120px]">{studentName}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">
                          {formatDate(referral.registeredAt)}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={cn("inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-tight", statusColor)}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full transition-[width]"
                                style={{ width: `${progress}%`, backgroundColor: THEME }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 whitespace-nowrap">{progressLabel}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-slate-900 text-right">
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
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          View all referrals
          <ChevronRight size={14} />
        </Link>
      </section>
    </div>
  );
}