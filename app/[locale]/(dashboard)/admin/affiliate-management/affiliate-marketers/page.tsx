"use client";

import { useState, useEffect } from "react";
import { Search, Ban, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "../../../../../../src/utils/cn";
import { affiliateService, type AffiliateProfile } from "@/src/lib/services/affiliateService";
import { toast } from "sonner";

function formatXAF(value: number): string {
  return value.toLocaleString("fr-FR") + " XAF";
}

type AffiliateMarketer = AffiliateProfile & {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

export default function AffiliateMarketersPage() {
  const [affiliates, setAffiliates] = useState<AffiliateMarketer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterBanned, setFilterBanned] = useState<"all" | "active" | "banned">("all");
  const [actingId, setActingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadAffiliates();
  }, [filterBanned, page]);

  const loadAffiliates = async () => {
    try {
      setLoading(true);
      const statusMap: Record<string, "SUSPENDED" | "TERMINATED" | undefined> = {
        all: undefined,
        active: undefined,
        banned: "SUSPENDED",
      };

      const response = await affiliateService.listAffiliates({
        page,
        limit: 50,
        status: statusMap[filterBanned],
        search: search || undefined,
      });

      setAffiliates(response.affiliates as AffiliateMarketer[]);
      setTotalPages(response.pagination.pages);
      setTotal(response.pagination.total);
    } catch (error: any) {
      console.error("Failed to load affiliates:", error);
      toast.error(error?.message || "Failed to load affiliates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (page === 1) {
        loadAffiliates();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [search]);

  const filtered = affiliates.filter((a) => {
    if (!search) return true;
    const name = a.user ? `${a.user.firstName} ${a.user.lastName}` : "";
    const email = a.user?.email || "";
    const code = a.referralCode || "";
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      code.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleToggleBan = async (affiliate: AffiliateMarketer) => {
    setActingId(affiliate.id);
    try {
      if (affiliate.status === "SUSPENDED" || affiliate.status === "TERMINATED") {
        await affiliateService.unsuspendAffiliate(affiliate.id);
        toast.success("Affiliate unsuspended successfully");
      } else {
        await affiliateService.suspendAffiliate(affiliate.id);
        toast.success("Affiliate suspended successfully");
      }
      await loadAffiliates();
    } catch (error: any) {
      console.error("Failed to toggle ban:", error);
      toast.error(error?.message || "Failed to update affiliate status");
    } finally {
      setActingId(null);
    }
  };

  if (loading && affiliates.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <header>
        <h1 className="text-lg font-bold text-slate-900 sm:text-xl lg:text-2xl">
          Affiliate Marketers
        </h1>
        <p className="mt-0.5 text-xs text-slate-600 sm:mt-1 sm:text-sm">
          View all affiliate marketers. Suspend or unsuspend accounts as needed. Amounts in XAF.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            size={16}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            placeholder="Search by name, email, code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "banned"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFilterBanned(opt)}
              className={cn(
                "rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors sm:text-sm",
                filterBanned === opt
                  ? "border-slate-700 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="min-w-0 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm sm:rounded-xl">
        <table className="w-full min-w-[520px] text-left text-xs sm:min-w-[640px] sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-2 py-2 font-medium text-slate-600 sm:px-3 sm:py-2.5">
                Code / Name
              </th>
              <th className="hidden px-2 py-2 font-medium text-slate-600 sm:table-cell sm:px-3 sm:py-2.5">
                Region
              </th>
              <th className="px-2 py-2 font-medium text-slate-600 sm:px-3 sm:py-2.5">
                Signups
              </th>
              <th className="px-2 py-2 font-medium text-slate-600 sm:px-3 sm:py-2.5">
                Earned (XAF)
              </th>
              <th className="px-2 py-2 font-medium text-slate-600 sm:px-3 sm:py-2.5">
                Status
              </th>
              <th className="px-2 py-2 font-medium text-slate-600 sm:px-3 sm:py-2.5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  {loading ? "Loading..." : "No affiliate marketers match your filters."}
                </td>
              </tr>
            ) : (
              filtered.map((affiliate) => {
                const isBanned = affiliate.status === "SUSPENDED" || affiliate.status === "TERMINATED";
                const name = affiliate.user ? `${affiliate.user.firstName} ${affiliate.user.lastName}` : "N/A";
                const email = affiliate.user?.email || "N/A";
                const regionName = affiliate.region?.name || "N/A";

                return (
                  <tr
                    key={affiliate.id}
                    className={cn(
                      "border-b border-slate-100",
                      isBanned && "bg-slate-50"
                    )}
                  >
                    <td className="px-2 py-2 sm:px-3 sm:py-2.5">
                      <div>
                        <span className="font-medium text-slate-900">
                          {affiliate.referralCode}
                        </span>
                        <span className="block text-slate-500 sm:inline sm:ml-1">
                          {name}
                        </span>
                      </div>
                      <div className="text-slate-500 sm:hidden">{email}</div>
                    </td>
                    <td className="hidden px-2 py-2 text-slate-600 sm:table-cell sm:px-3 sm:py-2.5">
                      {regionName}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 font-medium text-slate-900 sm:px-3 sm:py-2.5">
                      {affiliate.totalReferrals}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 font-medium text-slate-900 sm:px-3 sm:py-2.5">
                      {formatXAF(affiliate.totalEarned)}
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-2.5">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:text-xs",
                          isBanned
                            ? "bg-red-100 text-red-700"
                            : affiliate.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        )}
                      >
                        {affiliate.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-2.5">
                      <button
                        type="button"
                        disabled={actingId === affiliate.id || affiliate.status === "TERMINATED"}
                        onClick={() => handleToggleBan(affiliate)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
                          isBanned
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                        )}
                      >
                        {actingId === affiliate.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : isBanned ? (
                          <CheckCircle size={14} />
                        ) : (
                          <Ban size={14} />
                        )}
                        <span className="hidden sm:inline">
                          {isBanned ? "Unsuspend" : "Suspend"}
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-2 py-2 sm:px-3 sm:py-2">
            <p className="text-[10px] text-slate-500 sm:text-xs">
              Showing {(page - 1) * 50 + 1}–{Math.min(page * 50, total)} of {total} affiliates
            </p>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50 sm:px-2"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50 sm:px-2"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
