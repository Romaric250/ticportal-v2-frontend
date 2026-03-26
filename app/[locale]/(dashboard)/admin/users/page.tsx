"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Download, UserPlus, CreditCard, AlertCircle, GraduationCap, Gavel, Users, Loader2, Edit2, Trash2, MapPin, Undo2 } from "lucide-react";
import { adminService, type AdminUser, type UserFilters, type RegionStats } from "../../../../../src/lib/services/adminService";
import { affiliateService, type ReferralPaymentSummaryRow } from "../../../../../src/lib/services/affiliateService";
import { CAMEROON_REGIONS } from "../../../../../src/constants/regions";
import { toast } from "sonner";
import { cn } from "../../../../../src/utils/cn";
import { EditUserModal } from "../../../../../components/dashboard/admin/EditUserModal";
import { DeleteConfirmationModal } from "../../../../../components/dashboard/admin/DeleteConfirmationModal";
import { AddUserModal } from "../../../../../components/dashboard/admin/AddUserModal";
import { ManualSubscriptionModal } from "../../../../../components/dashboard/admin/ManualSubscriptionModal";
import { paymentService } from "../../../../../src/lib/services/paymentService";

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalUsers: number;
    pendingApprovals: number;
    mentorsAndLeads: number;
    unassignedJudges: number;
    totalUsersChange?: number;
  }>({
    totalUsers: 0,
    pendingApprovals: 0,
    mentorsAndLeads: 0,
    unassignedJudges: 0,
    totalUsersChange: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<UserFilters>({
    role: "All Roles",
    jurisdiction: "All Areas",
    status: "All Statuses",
    paymentStatus: undefined,
    search: "",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [regionPaymentFilter, setRegionPaymentFilter] = useState<"all" | "manual" | "online">("all");
  const [affiliatePaySummary, setAffiliatePaySummary] = useState<ReferralPaymentSummaryRow[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [manualSubscriptionOpen, setManualSubscriptionOpen] = useState(false);
  const [reversingUser, setReversingUser] = useState<AdminUser | null>(null);
  const [reverseLoading, setReverseLoading] = useState(false);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const [statsData, regionData, affSummary] = await Promise.all([
        adminService.getStats(),
        adminService.getUsersByRegionStats(regionPaymentFilter),
        affiliateService.getReferralPaymentSummary().catch(() => [] as ReferralPaymentSummaryRow[]),
      ]);
      setStats(statsData);
      setRegionStats(regionData);
      setAffiliatePaySummary(affSummary);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }, [regionPaymentFilter]);

  // Load users
  const loadUsers = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(page, pagination.limit, {
        ...filters,
        search: searchQuery || undefined,
      });
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast.error(error?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, pagination.limit]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (filters.role !== "STUDENT" && filters.role !== "All Roles") {
      setFilters((prev) =>
        prev.paymentStatus ? { ...prev, paymentStatus: undefined } : prev
      );
    }
  }, [filters.role]);

  useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  const handleApprove = async (userId: string) => {
    try {
      await adminService.approveUser(userId);
      toast.success("User approved successfully");
      loadUsers(pagination.page);
      loadStats();
    } catch (error: any) {
      toast.error(error?.message || "Failed to approve user");
    }
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
  };

  const handleDelete = (user: AdminUser) => {
    setDeletingUser(user);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    setDeleteLoading(true);
    try {
      await adminService.deleteUser(deletingUser.id);
      toast.success("User deleted successfully");
      setDeletingUser(null);
      loadUsers(pagination.page);
      loadStats();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleReverseConfirm = async () => {
    if (!reversingUser) return;

    setReverseLoading(true);
    try {
      await paymentService.reverseManualSubscription(reversingUser.id);
      toast.success("Manual subscription reversed. Student is now marked as not paid.");
      setReversingUser(null);
      loadUsers(pagination.page);
      loadStats();
    } catch (error: any) {
      toast.error(error?.message || "Failed to reverse subscription");
    } finally {
      setReverseLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.size === 0) return;
    setDeleteLoading(true);
    try {
      const result = await adminService.deleteUsers(Array.from(selectedIds));
      toast.success(result.deleted > 0 ? `Deleted ${result.deleted} user(s)` : "No users deleted");
      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} user(s) could not be deleted`);
      }
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      loadUsers(pagination.page);
      loadStats();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete users");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUserUpdated = () => {
    loadUsers(pagination.page);
    loadStats();
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchQuery }));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "JUDGE":
        return <Gavel size={15} className="text-slate-600" />;
      case "MENTOR":
      case "SQUAD_LEAD":
        return <GraduationCap size={15} className="text-slate-600" />;
      default:
        return <Users size={15} className="text-slate-600" />;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Oversee users, approve registrations, and manage roles for your jurisdiction.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {selectedIds.size > 0 && (
            <>
              <span className="text-sm text-slate-600">{selectedIds.size} selected</span>
              <button
                type="button"
                onClick={() => setBulkDeleteOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                <Trash2 size={16} />
                Delete selected
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-sm text-slate-500 hover:text-slate-700 underline"
              >
                Clear selection
              </button>
            </>
          )}
          <button className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            <Download size={16} />
            Import CSV
          </button>
          <button
            type="button"
            onClick={() => setManualSubscriptionOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <CreditCard size={16} />
            Manual Subscription
          </button>
          <button
            type="button"
            onClick={() => setAddUserOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            <UserPlus size={16} />
            Add New User
          </button>
        </div>
      </div>

      {/* Region Stats - Students by region with paid counts */}
      {regionStats.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <MapPin size={18} />
                Students by Region
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {regionPaymentFilter === "all" && "Paid = any confirmed payment • "}
                {regionPaymentFilter === "manual" && "Paid = students with manual/bank/cash payment • "}
                {regionPaymentFilter === "online" && "Paid = students with MoMo/card • "}
                {regionStats.reduce((a, r) => a + r.total, 0)} total students
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Count paid by</span>
              <select
                value={regionPaymentFilter}
                onChange={(e) =>
                  setRegionPaymentFilter(e.target.value as "all" | "manual" | "online")
                }
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
              >
                <option value="all">All methods</option>
                <option value="manual">Manual only</option>
                <option value="online">Online only</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Region</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Total</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Paid (filter)</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600 hidden sm:table-cell">Manual</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600 hidden sm:table-cell">Online</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">%</th>
                  <th className="px-4 py-3 w-24 font-medium text-slate-600">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {regionStats.map((r) => {
                  const pct = r.total > 0 ? Math.round((r.paid / r.total) * 100) : 0;
                  return (
                    <tr key={r.region} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-slate-900">{r.region}</td>
                      <td className="px-4 py-2.5 text-right text-slate-700">{r.total}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={r.paid > 0 ? "text-emerald-600 font-medium" : "text-slate-500"}>
                          {r.paid}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-600 hidden sm:table-cell">
                        {r.paidManual ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-600 hidden sm:table-cell">
                        {r.paidOnline ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-600">{pct}%</td>
                      <td className="px-4 py-2.5">
                        <div className="h-2 w-full min-w-[4rem] rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paid students by affiliate (referral attribution) */}
      {affiliatePaySummary.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-800">Paid students by affiliate</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Confirmed payments linked to a referral code • manual (bank/cash) vs online (MoMo/card)
            </p>
          </div>
          <div className="overflow-x-auto max-h-56 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Code</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Marketer</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Region</th>
                  <th className="px-4 py-2 text-right font-medium text-slate-600">Total</th>
                  <th className="px-4 py-2 text-right font-medium text-slate-600">Manual</th>
                  <th className="px-4 py-2 text-right font-medium text-slate-600">Online</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {affiliatePaySummary.map((row) => (
                  <tr key={row.affiliateId} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2 font-mono text-xs text-slate-800">{row.referralCode}</td>
                    <td className="px-4 py-2 text-slate-800">{row.marketerName || "—"}</td>
                    <td className="px-4 py-2 text-slate-600">{row.regionName}</td>
                    <td className="px-4 py-2 text-right font-medium text-slate-900">{row.totalPaid}</td>
                    <td className="px-4 py-2 text-right text-slate-700">{row.manualPaid}</td>
                    <td className="px-4 py-2 text-right text-slate-700">{row.onlinePaid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative rounded-xl border border-slate-200 bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Total Users</p>
              <p className="mt-2 text-3xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
              {stats.totalUsersChange && (
                <p className="mt-1.5 text-xs font-medium text-white/70">+{stats.totalUsersChange}% from last month</p>
              )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <Users size={22} className="text-white" />
            </div>
          </div>
        </div>

        <div className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="absolute right-5 top-5">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending Approvals</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.pendingApprovals}</p>
              <p className="mt-1.5 text-xs text-slate-500">Requires attention</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50">
              <AlertCircle size={22} className="text-amber-600" />
            </div>
          </div>
        </div>

        <div className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Mentors & Leads</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.mentorsAndLeads}</p>
              <p className="mt-1.5 text-xs text-slate-500">Active mentors</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
              <GraduationCap size={22} className="text-slate-700" />
            </div>
          </div>
        </div>

        <div className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="absolute right-5 top-5">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">Finals</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Unassigned Judges</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.unassignedJudges}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
              <Gavel size={22} className="text-slate-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, school, or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
          <select
            value={filters.role}
            onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm transition-colors focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option>All Roles</option>
            <option>STUDENT</option>
            <option>MENTOR</option>
            <option>JUDGE</option>
            <option>SQUAD_LEAD</option>
            <option>ADMIN</option>
          </select>
          <select
            value={filters.jurisdiction}
            onChange={(e) => setFilters((prev) => ({ ...prev, jurisdiction: e.target.value }))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm transition-colors focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option>All Regions</option>
            {CAMEROON_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {(filters.role === "STUDENT" || filters.role === "All Roles") && (
            <select
              value={filters.paymentStatus ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  paymentStatus: (e.target.value || undefined) as
                    | "paid"
                    | "not_paid"
                    | "manual_paid"
                    | undefined,
                }))
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm transition-colors focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="">All Payment Status</option>
              <option value="paid">Paid (any)</option>
              <option value="manual_paid">Manual paid</option>
              <option value="not_paid">Not paid</option>
            </select>
          )}
          <button className="rounded-lg border border-slate-300 bg-white p-2.5 transition-colors hover:bg-slate-50 hover:border-slate-900">
            <Filter size={18} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-3">
          {loading ? (
            <p className="text-sm text-slate-500">Loading results…</p>
          ) : pagination.total === 0 ? (
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">0</span> users match your filters
            </p>
          ) : (
            <p className="text-sm text-slate-600">
              <span className="font-semibold tabular-nums text-slate-900">
                {pagination.total.toLocaleString()}
              </span>{" "}
              {pagination.total === 1 ? "user matches" : "users match"} your filters
            </p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedIds.size === users.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  User Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Region
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Team
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Payment Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Loader2 size={28} className="mx-auto animate-spin text-slate-400" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <p className="text-sm font-medium text-slate-500">No users found</p>
                    <p className="mt-1 text-xs text-slate-400">Try adjusting your filters or search query</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.profilePhoto ? (
                          <img
                            src={user.profilePhoto}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white ring-2 ring-slate-100">
                            {getInitials(user.firstName, user.lastName)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="text-sm font-medium text-slate-700">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{user.region || "Unassigned"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{user.affiliation || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === "STUDENT" ? (
                        user.hasPaid ? (
                          user.isManualChannelPaid ? (
                            <div className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1">
                              <div className="h-2 w-2 rounded-full bg-slate-600" />
                              <span className="text-xs font-medium text-slate-800">Manual paid</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1">
                              <div className="h-2 w-2 rounded-full bg-slate-500" />
                              <span className="text-xs font-medium text-slate-800">Paid (online)</span>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1">
                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                            <span className="text-xs font-medium text-amber-700">Not paid</span>
                          </div>
                        )
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {user.role === "STUDENT" && user.hasPaid && user.isManualSubscription && (
                          <button
                            onClick={() => setReversingUser(user)}
                            className="rounded-lg p-2 text-amber-600 transition-colors hover:bg-amber-50 hover:text-amber-700"
                            title="Reverse manual subscription"
                          >
                            <Undo2 size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(user)}
                          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          title="Edit user"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination + total (total reflects active filters) */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row">
          <p className="text-sm font-medium text-slate-600">
            {pagination.total === 0 ? (
              <>No users match the current filters.</>
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>
                –
                <span className="font-semibold text-slate-900">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{" "}
                of <span className="font-semibold text-slate-900">{pagination.total}</span> matching
                users
              </>
            )}
          </p>
          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadUsers(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={cn(
                  "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-900",
                  pagination.page === 1 && "cursor-not-allowed opacity-50 hover:bg-white hover:border-slate-300"
                )}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => loadUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className={cn(
                  "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-900",
                  pagination.page >= pagination.totalPages && "cursor-not-allowed opacity-50 hover:bg-white hover:border-slate-300"
                )}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onUserUpdated={handleUserUpdated}
      />

      {/* Bulk Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Delete Selected Users"
        message={`Are you sure you want to delete ${selectedIds.size} user(s)? This action cannot be undone.`}
        itemName={undefined}
        loading={deleteLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone and will permanently remove the user from the system."
        itemName={deletingUser ? `${deletingUser.firstName} ${deletingUser.lastName} (${deletingUser.email})` : undefined}
        loading={deleteLoading}
      />

      {/* Reverse Manual Subscription Modal */}
      <DeleteConfirmationModal
        isOpen={!!reversingUser}
        onClose={() => setReversingUser(null)}
        onConfirm={handleReverseConfirm}
        title="Reverse Manual Subscription"
        message="Are you sure you want to reverse this manual subscription? The student will be marked as not paid. Affiliate commissions will be revoked."
        itemName={reversingUser ? `${reversingUser.firstName} ${reversingUser.lastName} (${reversingUser.email})` : undefined}
        loading={reverseLoading}
        confirmLabel="Reverse"
        loadingLabel="Reversing..."
        confirmVariant="warning"
        warningText="You can add a new manual subscription later if needed."
      />

      {/* Add User Modal (OTP verification flow) */}
      <AddUserModal
        isOpen={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        onUserCreated={() => {
          loadUsers(pagination.page);
          loadStats();
        }}
      />

      {/* Manual Subscription Modal */}
      <ManualSubscriptionModal
        isOpen={manualSubscriptionOpen}
        onClose={() => setManualSubscriptionOpen(false)}
        onSuccess={() => {
          loadUsers(pagination.page);
          loadStats();
        }}
      />
    </div>
  );
}

