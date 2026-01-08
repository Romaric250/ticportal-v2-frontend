"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Download, UserPlus, CheckCircle, AlertCircle, GraduationCap, Gavel, Users, Loader2 } from "lucide-react";
import { adminService, type AdminUser, type UserFilters } from "../../../../../src/lib/services/adminService";
import { toast } from "sonner";
import { cn } from "../../../../../src/utils/cn";

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
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

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchQuery }));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "JUDGE":
        return <Gavel size={14} className="text-slate-500" />;
      case "MENTOR":
      case "SQUAD_LEAD":
        return <GraduationCap size={14} className="text-slate-500" />;
      default:
        return <Users size={14} className="text-slate-500" />;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="mt-1 text-sm text-slate-600">
            Oversee users, approve registrations, and manage roles for your jurisdiction.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Download size={16} />
            Import CSV
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937]">
            <UserPlus size={16} />
            Add New User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Users</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{stats.totalUsers.toLocaleString()}</p>
              {stats.totalUsersChange && (
                <p className="mt-1 text-xs text-emerald-600">+{stats.totalUsersChange}%</p>
              )}
            </div>
            <div className="rounded-lg bg-slate-100 p-3">
              <Users size={20} className="text-slate-600" />
            </div>
          </div>
        </div>

        <div className="relative rounded-lg border border-slate-200 bg-white p-4">
          <div className="absolute right-4 top-4">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending Approvals</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{stats.pendingApprovals}</p>
              <p className="mt-1 text-xs text-slate-500">Requires attention</p>
            </div>
            <div className="rounded-lg bg-slate-100 p-3">
              <AlertCircle size={20} className="text-slate-600" />
            </div>
          </div>
        </div>

        <div className="relative rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Mentors & Leads</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{stats.mentorsAndLeads}</p>
              <p className="mt-1 text-xs text-slate-500">Active across 12 schools</p>
            </div>
            <div className="rounded-lg bg-slate-100 p-3">
              <GraduationCap size={20} className="text-slate-600" />
            </div>
          </div>
        </div>

        <div className="relative rounded-lg border border-slate-200 bg-white p-4">
          <div className="absolute right-4 top-4">
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">Finals</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Unassigned Judges</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{stats.unassignedJudges}</p>
            </div>
            <div className="rounded-lg bg-slate-100 p-3">
              <Gavel size={20} className="text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, school, or ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-[#111827] focus:outline-none"
          />
        </div>
        <select
          value={filters.role}
          onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
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
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
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
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
        >
          <option>All Statuses</option>
          <option>ACTIVE</option>
          <option>PENDING</option>
          <option>SUSPENDED</option>
          <option>INACTIVE</option>
        </select>
        <button className="rounded-lg border border-slate-300 bg-white p-2 hover:bg-slate-50">
          <Filter size={18} className="text-slate-600" />
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  USER DETAILS
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  ROLE
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  JURISDICTION
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  AFFILIATION
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 size={24} className="mx-auto animate-spin text-slate-400" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.profilePhoto ? (
                          <img
                            src={user.profilePhoto}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-slate-600 text-xs font-semibold text-white">
                            {getInitials(user.firstName, user.lastName)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="text-sm text-slate-700">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {user.jurisdiction || user.region || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {user.affiliation || user.school || "Unassigned"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusDot(user.status)}
                        <span className="text-sm text-slate-700">{user.status}</span>
                        {user.status === "PENDING" && (
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="ml-2 rounded bg-emerald-500 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-600"
                          >
                            Approve
                          </button>
                        )}
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
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-sm text-slate-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadUsers(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={cn(
                  "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50",
                  pagination.page === 1 && "cursor-not-allowed opacity-50"
                )}
              >
                Previous
              </button>
              <button
                onClick={() => loadUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className={cn(
                  "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50",
                  pagination.page >= pagination.totalPages && "cursor-not-allowed opacity-50"
                )}
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

