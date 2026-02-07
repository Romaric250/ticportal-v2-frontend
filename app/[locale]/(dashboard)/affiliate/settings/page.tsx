"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { affiliateService, type AffiliateProfile } from "@/src/lib/services/affiliateService";

const THEME = "#111827";

export default function AffiliateSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<AffiliateProfile | null>(null);
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    mobileMoneyNumber: "",
    mobileMoneyProvider: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await affiliateService.getProfile();
      setProfile(data);
      setFormData({
        bankName: data.bankName || "",
        accountNumber: data.accountNumber || "",
        accountName: data.accountName || "",
        mobileMoneyNumber: data.mobileMoneyNumber || "",
        mobileMoneyProvider: data.mobileMoneyProvider || "",
      });
    } catch (error: any) {
      console.error("Failed to load profile:", error);
      toast.error(error?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;

    // Only allow activation if status is PENDING
    if (profile.status === "PENDING") {
      try {
        setSaving(true);
        await affiliateService.activateAffiliate(profile.id, formData);
        toast.success("Profile activated successfully!");
        await loadProfile();
      } catch (error: any) {
        console.error("Failed to activate profile:", error);
        toast.error(error?.message || "Failed to activate profile");
      } finally {
        setSaving(false);
      }
    } else {
      toast.info("Profile is already activated. Contact admin to update payment details.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Failed to load profile data.</p>
      </div>
    );
  }

  const isPending = profile.status === "PENDING";
  const isActive = profile.status === "ACTIVE";

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Manage your affiliate account and payment preferences.
        </p>
      </header>

      {/* Status Banner */}
      {isPending && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <CheckCircle className="text-amber-600" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900">Account Pending Activation</h3>
              <p className="mt-1 text-xs text-amber-700">
                Complete your payment information below to activate your affiliate account and start earning commissions.
              </p>
            </div>
          </div>
        </div>
      )}

      {isActive && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <CheckCircle className="text-emerald-600" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-emerald-900">Account Active</h3>
              <p className="mt-1 text-xs text-emerald-700">
                Your affiliate account is active. Contact admin to update payment details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Info */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Profile Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Referral Code:</span>
            <span className="font-medium text-slate-900">{profile.referralCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status:</span>
            <span className="font-medium text-slate-900">{profile.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tier:</span>
            <span className="font-medium text-slate-900">{profile.tier}</span>
          </div>
          {profile.region && (
            <div className="flex justify-between">
              <span className="text-slate-500">Region:</span>
              <span className="font-medium text-slate-900">{profile.region.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Information Form */}
      {isPending && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Payment Information</h2>
          <p className="mb-6 text-xs text-slate-500">
            Provide your payment details to receive commissions. You can use either bank account or mobile money.
          </p>

          <div className="space-y-4">
            {/* Bank Details */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-slate-700">Bank Account (Optional)</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="bankName" className="block text-xs font-medium text-slate-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    id="bankName"
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="e.g. Bank of Africa"
                  />
                </div>
                <div>
                  <label htmlFor="accountNumber" className="block text-xs font-medium text-slate-700 mb-1">
                    Account Number
                  </label>
                  <input
                    id="accountNumber"
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="Account number"
                  />
                </div>
                <div>
                  <label htmlFor="accountName" className="block text-xs font-medium text-slate-700 mb-1">
                    Account Name
                  </label>
                  <input
                    id="accountName"
                    type="text"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="Account holder name"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Money */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-slate-700">Mobile Money (Optional)</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="mobileMoneyProvider" className="block text-xs font-medium text-slate-700 mb-1">
                    Provider
                  </label>
                  <select
                    id="mobileMoneyProvider"
                    value={formData.mobileMoneyProvider}
                    onChange={(e) => setFormData({ ...formData, mobileMoneyProvider: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">Select provider</option>
                    <option value="MTN">MTN Mobile Money</option>
                    <option value="Orange">Orange Money</option>
                    <option value="Express Union">Express Union</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="mobileMoneyNumber" className="block text-xs font-medium text-slate-700 mb-1">
                    Mobile Money Number
                  </label>
                  <input
                    id="mobileMoneyNumber"
                    type="text"
                    value={formData.mobileMoneyNumber}
                    onChange={(e) => setFormData({ ...formData, mobileMoneyNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="e.g. +237677123456"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-70"
                style={{ backgroundColor: THEME }}
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Activating...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Activate Account
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
