"use client";

import { useState } from "react";
import { Search, Ban, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "../../../../../../src/utils/cn";

// Mock data – replace with API when backend is ready
type AffiliateMarketer = {
  id: string;
  code: string;
  name: string;
  email: string;
  region: string;
  signups: number;
  totalEarned: number;
  isBanned: boolean;
  bannedAt?: string;
};

const mockAffiliates: AffiliateMarketer[] = [
  {
    id: "1",
    code: "AF-8829",
    name: "Jane Doe",
    email: "jane@example.com",
    region: "California South",
    signups: 124,
    totalEarned: 124000,
    isBanned: false,
  },
  {
    id: "2",
    code: "AF-8830",
    name: "Marcus Smith",
    email: "marcus@example.com",
    region: "Texas East",
    signups: 89,
    totalEarned: 89000,
    isBanned: true,
    bannedAt: "2026-01-15",
  },
  {
    id: "3",
    code: "AF-8831",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    region: "Northeast Division",
    signups: 156,
    totalEarned: 156000,
    isBanned: false,
  },
];

function formatXAF(value: number): string {
  return value.toLocaleString("fr-FR") + " XAF";
}

export default function AffiliateMarketersPage() {
  const [affiliates, setAffiliates] = useState<AffiliateMarketer[]>(mockAffiliates);
  const [search, setSearch] = useState("");
  const [filterBanned, setFilterBanned] = useState<"all" | "active" | "banned">("all");
  const [actingId, setActingId] = useState<string | null>(null);

  const filtered = affiliates.filter((a) => {
    const matchesSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filterBanned === "all" ||
      (filterBanned === "banned" && a.isBanned) ||
      (filterBanned === "active" && !a.isBanned);
    return matchesSearch && matchesFilter;
  });

  const handleToggleBan = async (affiliate: AffiliateMarketer) => {
    setActingId(affiliate.id);
    try {
      // TODO: call API POST /api/affiliates/:id/ban or /unban
      await new Promise((r) => setTimeout(r, 500));
      setAffiliates((prev) =>
        prev.map((a) =>
          a.id === affiliate.id
            ? {
                ...a,
                isBanned: !a.isBanned,
                bannedAt: !a.isBanned ? new Date().toISOString().slice(0, 10) : undefined,
              }
            : a
        )
      );
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <header>
        <h1 className="text-lg font-bold text-slate-900 sm:text-xl lg:text-2xl">
          Affiliate Marketers
        </h1>
        <p className="mt-0.5 text-xs text-slate-600 sm:mt-1 sm:text-sm">
          View all affiliate marketers. Ban or unban accounts as needed. Amounts in XAF.
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
                  No affiliate marketers match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((affiliate) => (
                <tr
                  key={affiliate.id}
                  className={cn(
                    "border-b border-slate-100",
                    affiliate.isBanned && "bg-slate-50"
                  )}
                >
                  <td className="px-2 py-2 sm:px-3 sm:py-2.5">
                    <div>
                      <span className="font-medium text-slate-900">
                        {affiliate.code}
                      </span>
                      <span className="block text-slate-500 sm:inline sm:ml-1">
                        {affiliate.name}
                      </span>
                    </div>
                    <div className="text-slate-500 sm:hidden">{affiliate.email}</div>
                  </td>
                  <td className="hidden px-2 py-2 text-slate-600 sm:table-cell sm:px-3 sm:py-2.5">
                    {affiliate.region}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 font-medium text-slate-900 sm:px-3 sm:py-2.5">
                    {affiliate.signups}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 font-medium text-slate-900 sm:px-3 sm:py-2.5">
                    {formatXAF(affiliate.totalEarned)}
                  </td>
                  <td className="px-2 py-2 sm:px-3 sm:py-2.5">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:text-xs",
                        affiliate.isBanned
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      )}
                    >
                      {affiliate.isBanned ? "Banned" : "Active"}
                    </span>
                  </td>
                  <td className="px-2 py-2 sm:px-3 sm:py-2.5">
                    <button
                      type="button"
                      disabled={actingId === affiliate.id}
                      onClick={() => handleToggleBan(affiliate)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
                        affiliate.isBanned
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                      )}
                    >
                      {actingId === affiliate.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : affiliate.isBanned ? (
                        <CheckCircle size={14} />
                      ) : (
                        <Ban size={14} />
                      )}
                      <span className="hidden sm:inline">
                        {affiliate.isBanned ? "Unban" : "Ban"}
                      </span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
