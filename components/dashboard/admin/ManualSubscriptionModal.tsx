"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, CheckCircle, Search } from "lucide-react";
import { cn } from "@/src/utils/cn";
import { toast } from "sonner";
import { paymentService } from "@/src/lib/services/paymentService";
import { affiliateService } from "@/src/lib/services/affiliateService";
import { adminService } from "@/src/lib/services/adminService";
import type { Country } from "@/src/lib/services/affiliateService";
import type { AdminUser } from "@/src/lib/services/adminService";

type AffiliateOption = {
  id: string;
  referralCode: string;
  user?: { firstName: string; lastName: string; email: string };
};

export function ManualSubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [countryId, setCountryId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [success, setSuccess] = useState(false);

  // User search
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<AdminUser[]>([]);
  const [userSearching, setUserSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  // Affiliate search
  const [affiliateSearch, setAffiliateSearch] = useState("");
  const [affiliateResults, setAffiliateResults] = useState<AffiliateOption[]>([]);
  const [affiliateSearching, setAffiliateSearching] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<AffiliateOption | null>(null);
  const [affiliateDropdownOpen, setAffiliateDropdownOpen] = useState(false);
  const affiliateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadCountries();
    }
  }, [isOpen]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (userSearch.trim().length >= 2) {
        setUserSearching(true);
        adminService
          .getUsers(1, 10, { role: "STUDENT", search: userSearch.trim() })
          .then((res) => {
            setUserResults(res.users);
            setUserDropdownOpen(true);
          })
          .catch(() => setUserResults([]))
          .finally(() => setUserSearching(false));
      } else {
        setUserResults([]);
        setUserDropdownOpen(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [userSearch]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (affiliateSearch.trim().length >= 2) {
        setAffiliateSearching(true);
        affiliateService
          .listAffiliates({ search: affiliateSearch.trim(), limit: 10, status: "ACTIVE" })
          .then((res) => {
            setAffiliateResults(
              res.affiliates.map((a) => ({
                id: a.id,
                referralCode: a.referralCode,
                user: a.user,
              }))
            );
            setAffiliateDropdownOpen(true);
          })
          .catch(() => setAffiliateResults([]))
          .finally(() => setAffiliateSearching(false));
      } else {
        setAffiliateResults([]);
        setAffiliateDropdownOpen(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [affiliateSearch]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        userRef.current && !userRef.current.contains(e.target as Node) &&
        affiliateRef.current && !affiliateRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
        setAffiliateDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const loadCountries = async () => {
    setLoadingCountries(true);
    try {
      const countriesData = await affiliateService.getCountries();
      setCountries(countriesData);
      if (countriesData.length > 0 && !countryId) {
        const first = countriesData[0];
        setCountryId(first.id);
        setAmount(String(first.studentPrice));
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to load countries");
    } finally {
      setLoadingCountries(false);
    }
  };

  const selectedCountry = countries.find((c) => c.id === countryId);
  const minAmount = selectedCountry?.studentPrice ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !countryId || !amount) {
      toast.error("Please search and select a user, choose country, and enter amount");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < minAmount) {
      toast.error(`Amount must be at least ${minAmount} ${selectedCountry?.currency ?? "XAF"}`);
      return;
    }
    setLoading(true);
    try {
      await paymentService.createManualSubscription({
        userId: selectedUser.id,
        countryId,
        amount: numAmount,
        affiliateId: selectedAffiliate?.id || undefined,
      });
      setSuccess(true);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setUserSearch("");
    setCountryId("");
    setAmount("");
    setSelectedAffiliate(null);
    setAffiliateSearch("");
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} aria-hidden />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Manual Subscription</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <CheckCircle size={20} />
              <span className="text-sm font-medium">Subscription created successfully</span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Done
            </button>
          </div>
        ) : loadingCountries ? (
          <div className="mt-8 flex justify-center">
            <Loader2 size={28} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* User search */}
            <div ref={userRef} className="relative">
              <label className="block text-sm font-medium text-slate-700">User (Student)</label>
              <div className="relative mt-1.5">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName} (${selectedUser.email})` : userSearch}
                  onChange={(e) => {
                    if (selectedUser) {
                      setSelectedUser(null);
                      setUserSearch(e.target.value);
                    } else {
                      setUserSearch(e.target.value);
                    }
                  }}
                  onFocus={() => {
                    if (userResults.length > 0) setUserDropdownOpen(true);
                  }}
                  placeholder="Search by name or email..."
                  required={!selectedUser}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                {selectedUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(null);
                      setUserSearch("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {userDropdownOpen && (userResults.length > 0 || userSearching) && !selectedUser && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg max-h-48 overflow-auto">
                  {userSearching ? (
                    <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-slate-500">
                      <Loader2 size={16} className="animate-spin" />
                      Searching...
                    </div>
                  ) : (
                    userResults.map((u) => {
                      const isPaid = u.hasPaid === true;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          disabled={isPaid}
                          onClick={() => {
                            if (isPaid) return;
                            setSelectedUser(u);
                            setUserSearch("");
                            setUserDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full px-4 py-2.5 text-left text-sm border-b border-slate-100 last:border-0 flex items-center justify-between gap-2",
                            isPaid
                              ? "cursor-not-allowed bg-slate-50 text-slate-400"
                              : "hover:bg-slate-50"
                          )}
                        >
                          <span>
                            {u.firstName} {u.lastName} ({u.email})
                          </span>
                          {isPaid && (
                            <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              Paid
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Country</label>
              <select
                value={countryId}
                onChange={(e) => {
                  setCountryId(e.target.value);
                  const c = countries.find((x) => x.id === e.target.value);
                  if (c) setAmount(String(c.studentPrice));
                }}
                required
                className="mt-1.5 w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.studentPrice} {c.currency})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Amount ({selectedCountry?.currency ?? "XAF"})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={minAmount}
                step="100"
                required
                className="mt-1.5 w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <p className="mt-1 text-xs text-slate-500">
                Min: {minAmount} {selectedCountry?.currency ?? "XAF"}
              </p>
            </div>

            {/* Affiliate search (optional) */}
            <div ref={affiliateRef} className="relative">
              <label className="block text-sm font-medium text-slate-700">Affiliate (optional)</label>
              <div className="relative mt-1.5">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={
                    selectedAffiliate
                      ? `${selectedAffiliate.user ? `${selectedAffiliate.user.firstName} ${selectedAffiliate.user.lastName}` : selectedAffiliate.referralCode} (${selectedAffiliate.referralCode})`
                      : affiliateSearch
                  }
                  onChange={(e) => {
                    if (selectedAffiliate) {
                      setSelectedAffiliate(null);
                      setAffiliateSearch(e.target.value);
                    } else {
                      setAffiliateSearch(e.target.value);
                    }
                  }}
                  onFocus={() => {
                    if (affiliateResults.length > 0) setAffiliateDropdownOpen(true);
                  }}
                  placeholder="Search by name or referral code..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                {selectedAffiliate && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAffiliate(null);
                      setAffiliateSearch("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {affiliateDropdownOpen && (affiliateResults.length > 0 || affiliateSearching) && !selectedAffiliate && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg max-h-48 overflow-auto">
                  {affiliateSearching ? (
                    <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-slate-500">
                      <Loader2 size={16} className="animate-spin" />
                      Searching...
                    </div>
                  ) : (
                    affiliateResults.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setSelectedAffiliate(a);
                          setAffiliateSearch("");
                          setAffiliateDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0"
                      >
                        {a.user ? `${a.user.firstName} ${a.user.lastName}` : a.referralCode} ({a.referralCode})
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedUser}
                className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={18} className="mx-auto animate-spin" />
                ) : (
                  "Create Subscription"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
