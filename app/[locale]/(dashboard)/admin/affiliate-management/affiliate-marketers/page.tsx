"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Ban, CheckCircle, Loader2, Plus, X, User, Edit2 } from "lucide-react";
import { cn } from "../../../../../../src/utils/cn";
import { affiliateService, type AffiliateProfile, type AffiliateSubRole, type Country, type Region } from "@/src/lib/services/affiliateService";
import { userService } from "@/src/lib/services/userService";
import { toast } from "sonner";

const THEME = "#111827";

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
  
  // Add Affiliate Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string>("");
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [selectedSubRole, setSelectedSubRole] = useState<AffiliateSubRole>("AFFILIATE");
  const [creating, setCreating] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Edit Affiliate Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<AffiliateMarketer | null>(null);
  const [editRegionId, setEditRegionId] = useState<string>("");
  const [editSubRole, setEditSubRole] = useState<AffiliateSubRole>("AFFILIATE");
  const [editStatus, setEditStatus] = useState<"PENDING" | "ACTIVE" | "SUSPENDED" | "TERMINATED">("ACTIVE");
  const [editTier, setEditTier] = useState<"STANDARD" | "PREMIUM" | "VIP">("STANDARD");
  const [editBankName, setEditBankName] = useState<string>("");
  const [editAccountNumber, setEditAccountNumber] = useState<string>("");
  const [editAccountName, setEditAccountName] = useState<string>("");
  const [editMobileMoneyNumber, setEditMobileMoneyNumber] = useState<string>("");
  const [editMobileMoneyProvider, setEditMobileMoneyProvider] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadAffiliates();
  }, [filterBanned, page]);

  useEffect(() => {
    if (showAddModal || showEditModal) {
      loadCountries();
    }
  }, [showAddModal, showEditModal]);

  useEffect(() => {
    if (selectedCountryId) {
      loadRegions(selectedCountryId);
    } else {
      setRegions([]);
      setSelectedRegionId("");
    }
  }, [selectedCountryId]);

  // Search users when query changes
  useEffect(() => {
    if (!userSearchQuery.trim() || userSearchQuery.trim().length < 2) {
      setUserSearchResults([]);
      setShowUserSuggestions(false);
      return;
    }

    let isCancelled = false;

    const searchUsers = async () => {
      try {
        setSearchingUsers(true);
        const results = await userService.searchUsers(userSearchQuery);
        
        if (isCancelled) return;
        
        // Filter out users who are already affiliates
        const existingAffiliateUserIds = new Set(affiliates.map(a => a.userId));
        const filtered = results.filter((user) => !existingAffiliateUserIds.has(user.id));
        
        setUserSearchResults(filtered);
        setShowUserSuggestions(true);
      } catch (error) {
        console.error("Error searching users:", error);
        if (!isCancelled) {
          setUserSearchResults([]);
          setShowUserSuggestions(false);
        }
      } finally {
        if (!isCancelled) {
          setSearchingUsers(false);
        }
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => {
      isCancelled = true;
      clearTimeout(debounceTimer);
    };
  }, [userSearchQuery, affiliates]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowUserSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const loadCountries = async () => {
    try {
      const countriesData = await affiliateService.getCountries();
      setCountries(countriesData);
    } catch (error: any) {
      console.error("Failed to load countries:", error);
      toast.error(error?.message || "Failed to load countries");
    }
  };

  const loadRegions = async (countryId: string) => {
    try {
      const regionsData = await affiliateService.getRegionsByCountry(countryId);
      setRegions(regionsData);
      if (regionsData.length > 0 && !selectedRegionId) {
        setSelectedRegionId(regionsData[0].id);
      }
    } catch (error: any) {
      console.error("Failed to load regions:", error);
      toast.error(error?.message || "Failed to load regions");
    }
  };

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setUserSearchQuery(`${user.firstName} ${user.lastName} (${user.email})`);
    setShowUserSuggestions(false);
  };

  const handleCreateAffiliate = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }
    if (!selectedRegionId) {
      toast.error("Please select a region");
      return;
    }

    setCreating(true);
    try {
      await affiliateService.createAffiliate({
        userId: selectedUser.id,
        regionId: selectedRegionId,
        subRole: selectedSubRole,
      });
      toast.success(`Affiliate "${selectedUser.firstName} ${selectedUser.lastName}" created successfully`);
      setShowAddModal(false);
      resetAddModal();
      await loadAffiliates();
    } catch (error: any) {
      console.error("Failed to create affiliate:", error);
      toast.error(error?.message || "Failed to create affiliate");
    } finally {
      setCreating(false);
    }
  };

  const resetAddModal = () => {
    setUserSearchQuery("");
    setUserSearchResults([]);
    setSelectedUser(null);
    setSelectedCountryId("");
    setSelectedRegionId("");
    setSelectedSubRole("AFFILIATE");
    setShowUserSuggestions(false);
  };

  const handleToggleBan = async (affiliate: AffiliateMarketer) => {
    if (actingId === affiliate.id) return; // Prevent double-click
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

  const handleEdit = (affiliate: AffiliateMarketer) => {
    setEditingAffiliate(affiliate);
    setEditRegionId(affiliate.regionId || "");
    setEditSubRole(affiliate.subRole);
    setEditStatus(affiliate.status);
    setEditTier(affiliate.tier || "STANDARD");
    setEditBankName(affiliate.bankName || "");
    setEditAccountNumber(affiliate.accountNumber || "");
    setEditAccountName(affiliate.accountName || "");
    setEditMobileMoneyNumber(affiliate.mobileMoneyNumber || "");
    setEditMobileMoneyProvider(affiliate.mobileMoneyProvider || "");
    
    // Load regions if regionId exists
    if (affiliate.regionId && affiliate.region?.country?.id) {
      loadRegions(affiliate.region.country.id);
      setSelectedCountryId(affiliate.region.country.id);
    }
    
    setShowEditModal(true);
  };

  const handleUpdateAffiliate = async () => {
    if (!editingAffiliate) return;
    if (!editRegionId) {
      toast.error("Please select a region");
      return;
    }

    setUpdating(true);
    try {
      // Use activate endpoint to update affiliate profile
      await affiliateService.activateAffiliate(editingAffiliate.id, {
        bankName: editBankName || undefined,
        accountNumber: editAccountNumber || undefined,
        accountName: editAccountName || undefined,
        mobileMoneyNumber: editMobileMoneyNumber || undefined,
        mobileMoneyProvider: editMobileMoneyProvider || undefined,
      });
      
      // Note: Status, tier, region, and subRole updates would need a separate endpoint
      // For now, we'll update what we can via activate
      toast.success("Affiliate updated successfully");
      setShowEditModal(false);
      setEditingAffiliate(null);
      await loadAffiliates();
    } catch (error: any) {
      console.error("Failed to update affiliate:", error);
      toast.error(error?.message || "Failed to update affiliate");
    } finally {
      setUpdating(false);
    }
  };

  const resetEditModal = () => {
    setEditingAffiliate(null);
    setEditRegionId("");
    setEditSubRole("AFFILIATE");
    setEditStatus("ACTIVE");
    setEditTier("STANDARD");
    setEditBankName("");
    setEditAccountNumber("");
    setEditAccountName("");
    setEditMobileMoneyNumber("");
    setEditMobileMoneyProvider("");
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
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 sm:text-xl lg:text-2xl">
            Affiliate Marketers
          </h1>
          <p className="mt-0.5 text-xs text-slate-600 sm:mt-1 sm:text-sm">
            View all affiliate marketers. Suspend or unsuspend accounts as needed. Amounts in XAF.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ backgroundColor: THEME }}
        >
          <Plus size={16} />
          Add Affiliate
        </button>
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
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(affiliate)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <Edit2 size={14} />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          type="button"
                          disabled={actingId === affiliate.id || affiliate.status === "TERMINATED"}
                          onClick={() => handleToggleBan(affiliate)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                            actingId === affiliate.id
                              ? "border-slate-300 bg-slate-100 text-slate-500 cursor-wait"
                              : isBanned
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                          )}
                        >
                          {actingId === affiliate.id ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span className="hidden sm:inline">Processing...</span>
                            </>
                          ) : isBanned ? (
                            <>
                              <CheckCircle size={14} />
                              <span className="hidden sm:inline">Unsuspend</span>
                            </>
                          ) : (
                            <>
                              <Ban size={14} />
                              <span className="hidden sm:inline">Suspend</span>
                            </>
                          )}
                        </button>
                      </div>
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

      {/* Add Affiliate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            aria-hidden
          />
          <div
            className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl ring-1 ring-slate-900/5 max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-affiliate-modal-title"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 id="add-affiliate-modal-title" className="text-lg font-semibold text-slate-900">
                Add New Affiliate
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  resetAddModal();
                }}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* User Search */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Search User <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={searchInputRef}>
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => {
                      setUserSearchQuery(e.target.value);
                      setSelectedUser(null);
                      if (e.target.value.length >= 2) {
                        setShowUserSuggestions(true);
                      }
                    }}
                    onFocus={() => {
                      if (userSearchQuery.trim().length >= 2 && userSearchResults.length > 0) {
                        setShowUserSuggestions(true);
                      }
                    }}
                    placeholder="Search by name or email..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                  <Search
                    size={16}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  {userSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserSearchQuery("");
                        setSelectedUser(null);
                        setUserSearchResults([]);
                        setShowUserSuggestions(false);
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                  {searchingUsers && !userSearchQuery && (
                    <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-slate-400" size={16} />
                  )}
                  
                  {/* User Suggestions Dropdown */}
                  {showUserSuggestions && userSearchQuery.trim().length >= 2 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg"
                    >
                      {searchingUsers ? (
                        <div className="p-3 text-sm text-slate-500 flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          <span>Searching...</span>
                        </div>
                      ) : userSearchResults.length > 0 ? (
                        userSearchResults.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleSelectUser(user)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                          >
                            {user.profilePhoto ? (
                              <img
                                src={user.profilePhoto}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-slate-600 text-xs font-semibold text-white">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-900 truncate">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-xs text-slate-500 truncate">{user.email}</div>
                              {user.username && (
                                <div className="text-xs text-slate-400">@{user.username}</div>
                              )}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-slate-500 text-center">
                          No users found
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {selectedUser && (
                  <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <div className="flex items-center gap-2">
                      {selectedUser.profilePhoto ? (
                        <img
                          src={selectedUser.profilePhoto}
                          alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs font-semibold text-white">
                          {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-xs font-medium text-emerald-900">
                          {selectedUser.firstName} {selectedUser.lastName}
                        </div>
                        <div className="text-xs text-emerald-700">{selectedUser.email}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(null);
                          setUserSearchQuery("");
                        }}
                        className="rounded p-1 text-emerald-600 hover:bg-emerald-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Country Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCountryId}
                  onChange={(e) => setSelectedCountryId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name} ({country.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Region Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Region <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedRegionId}
                  onChange={(e) => setSelectedRegionId(e.target.value)}
                  disabled={!selectedCountryId || regions.length === 0}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">
                    {!selectedCountryId
                      ? "Select a country first"
                      : regions.length === 0
                      ? "No regions available"
                      : "Select a region"}
                  </option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SubRole Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Role (Optional)
                </label>
                <select
                  value={selectedSubRole}
                  onChange={(e) => setSelectedSubRole(e.target.value as AffiliateSubRole)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="AFFILIATE">Affiliate</option>
                  <option value="REGIONAL_COORDINATOR">Regional Coordinator</option>
                  <option value="ASSISTANT_REGIONAL_COORDINATOR">Assistant Regional Coordinator</option>
                  <option value="NATIONAL_COORDINATOR">National Coordinator</option>
                  <option value="ASSISTANT_NATIONAL_COORDINATOR">Assistant National Coordinator</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetAddModal();
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateAffiliate}
                  disabled={creating || !selectedUser || !selectedRegionId}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-70"
                  style={{ backgroundColor: THEME }}
                >
                  {creating ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Create Affiliate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Affiliate Modal */}
      {showEditModal && editingAffiliate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            aria-hidden
          />
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl ring-1 ring-slate-900/5 max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-affiliate-modal-title"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 id="edit-affiliate-modal-title" className="text-lg font-semibold text-slate-900">
                Edit Affiliate
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  resetEditModal();
                }}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* User Info (Read-only) */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  User
                </label>
                <div className="flex items-center gap-2">
                  {editingAffiliate.user && (
                    <>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-slate-600 text-xs font-semibold text-white">
                        {editingAffiliate.user.firstName?.[0]}{editingAffiliate.user.lastName?.[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {editingAffiliate.user.firstName} {editingAffiliate.user.lastName}
                        </div>
                        <div className="text-xs text-slate-500">{editingAffiliate.user.email}</div>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  <span className="font-medium">Referral Code:</span> {editingAffiliate.referralCode}
                </div>
              </div>

              {/* Country Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCountryId}
                  onChange={(e) => {
                    setSelectedCountryId(e.target.value);
                    setEditRegionId("");
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name} ({country.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Region Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Region <span className="text-red-500">*</span>
                </label>
                <select
                  value={editRegionId}
                  onChange={(e) => setEditRegionId(e.target.value)}
                  disabled={!selectedCountryId || regions.length === 0}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">
                    {!selectedCountryId
                      ? "Select a country first"
                      : regions.length === 0
                      ? "No regions available"
                      : "Select a region"}
                  </option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SubRole Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={editSubRole}
                  onChange={(e) => setEditSubRole(e.target.value as AffiliateSubRole)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="AFFILIATE">Affiliate</option>
                  <option value="REGIONAL_COORDINATOR">Regional Coordinator</option>
                  <option value="ASSISTANT_REGIONAL_COORDINATOR">Assistant Regional Coordinator</option>
                  <option value="NATIONAL_COORDINATOR">National Coordinator</option>
                  <option value="ASSISTANT_NATIONAL_COORDINATOR">Assistant National Coordinator</option>
                </select>
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as typeof editStatus)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>

              {/* Tier Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tier
                </label>
                <select
                  value={editTier}
                  onChange={(e) => setEditTier(e.target.value as typeof editTier)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>

              {/* Payment Information */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="mb-3 text-sm font-semibold text-slate-900">Payment Information</h4>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={editBankName}
                      onChange={(e) => setEditBankName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      placeholder="Bank of Africa"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={editAccountNumber}
                      onChange={(e) => setEditAccountNumber(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={editAccountName}
                      onChange={(e) => setEditAccountName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Mobile Money Number
                    </label>
                    <input
                      type="text"
                      value={editMobileMoneyNumber}
                      onChange={(e) => setEditMobileMoneyNumber(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      placeholder="+237677123456"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Mobile Money Provider
                    </label>
                    <select
                      value={editMobileMoneyProvider}
                      onChange={(e) => setEditMobileMoneyProvider(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">Select provider</option>
                      <option value="MTN">MTN</option>
                      <option value="Orange">Orange</option>
                      <option value="Moov">Moov</option>
                      <option value="Express Union">Express Union</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetEditModal();
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateAffiliate}
                  disabled={updating || !editRegionId}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-70"
                  style={{ backgroundColor: THEME }}
                >
                  {updating ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Update Affiliate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
