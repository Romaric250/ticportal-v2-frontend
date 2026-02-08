"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Download, UserPlus, CheckCircle, AlertCircle, GraduationCap, Gavel, Users, Loader2, Edit2, Trash2 } from "lucide-react";
import { adminService, type AdminUser, type UserFilters } from "../../../../../src/lib/services/adminService";
import { toast } from "sonner";
import { cn } from "../../../../../src/utils/cn";
import { EditUserModal } from "../../../../../components/dashboard/admin/EditUserModal";
import { DeleteConfirmationModal } from "../../../../../components/dashboard/admin/DeleteConfirmationModal";

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
    search: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const statsData = await adminService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }, []);

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

  const getStatusDot = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <div className="h-2 w-2 rounded-full bg-emerald-500" />;
      case "PENDING":
        return <div className="h-2 w-2 rounded-full bg-amber-500" />;
      case "SUSPENDED":
        return <div className="h-2 w-2 rounded-full bg-red-500" />;
      default:
        return <div className="h-2 w-2 rounded-full bg-slate-400" />;
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
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            <Download size={16} />
            Import CSV
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800">
            <UserPlus size={16} />
            Add New User
          </button>
        </div>
      </div>

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
            <option>All Areas</option>
            <option>North Region</option>
            <option>South Region</option>
            <option>East Region</option>
            <option>West Region</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm transition-colors focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option>All Statuses</option>
            <option>ACTIVE</option>
            <option>PENDING</option>
            <option>SUSPENDED</option>
            <option>INACTIVE</option>
          </select>
          <button className="rounded-lg border border-slate-300 bg-white p-2.5 transition-colors hover:bg-slate-50 hover:border-slate-900">
            <Filter size={18} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  User Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Jurisdiction
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Affiliation
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Status
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
                      <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
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
                      <span className="text-sm text-slate-700">{user.jurisdiction || user.region || "Unassigned"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{user.affiliation || user.school || "Unassigned"}</span>
                    </td>
                    <td className="px-6 py-4">
                      {user.status === "PENDING" ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1">
                            {getStatusDot(user.status)}
                            <span className="text-xs font-medium text-amber-700">Pending</span>
                          </div>
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-slate-800"
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {getStatusDot(user.status)}
                          <span className="text-xs font-medium text-slate-700">{user.status}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row">
            <p className="text-sm font-medium text-slate-600">
              Showing <span className="font-semibold text-slate-900">{((pagination.page - 1) * pagination.limit) + 1}</span> to{" "}
              <span className="font-semibold text-slate-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{" "}
              <span className="font-semibold text-slate-900">{pagination.total}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button
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
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onUserUpdated={handleUserUpdated}
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
    </div>
  );
}

