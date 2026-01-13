"use client";

import { useEffect, useState } from "react";
import { Users, AlertCircle, GraduationCap, Gavel, TrendingUp, Activity } from "lucide-react";
import { adminService } from "../../../../src/lib/services/adminService";
import { toast } from "sonner";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type DashboardStats = {
  totalUsers: number;
  pendingApprovals: number;
  mentorsAndLeads: number;
  unassignedJudges: number;
  totalUsersChange?: number;
  usersByRole: { role: string; count: number }[];
  usersByStatus: { status: string; count: number }[];
  usersOverTime: { date: string; users: number }[];
  teamsCount: number;
  activeTeams: number;
};

const COLORS = ["#111827", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminDashboardPage() {
  const locale = useLocale();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingApprovals: 0,
    mentorsAndLeads: 0,
    unassignedJudges: 0,
    totalUsersChange: 0,
    usersByRole: [],
    usersByStatus: [],
    usersOverTime: [],
    teamsCount: 0,
    activeTeams: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const statsData = await adminService.getStats();
        const dashboardStats = await adminService.getDashboardStats();
        
        setStats({
          ...statsData,
          ...dashboardStats,
        });
      } catch (error: any) {
        console.error("Error loading stats:", error);
        toast.error(error?.message || "Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Overview of users, teams, and system activity for your jurisdiction.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200"></div>
                    <div className="mt-3 h-8 w-16 animate-pulse rounded bg-slate-200"></div>
                    <div className="mt-2 h-3 w-20 animate-pulse rounded bg-slate-200"></div>
                  </div>
                  <div className="h-12 w-12 animate-pulse rounded-lg bg-slate-200"></div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <Link
              href={`/${locale}/admin/users`}
              className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-[#111827] hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Users</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                  {stats.totalUsersChange && (
                    <p className="mt-1 text-xs text-emerald-600">+{stats.totalUsersChange}%</p>
                  )}
                </div>
                <div className="rounded-lg bg-slate-100 p-3">
                  <Users size={20} className="text-slate-600" />
                </div>
              </div>
            </Link>

            <Link
              href={`/${locale}/admin/users?status=PENDING`}
              className="relative rounded-lg border border-slate-200 bg-white p-4 transition hover:border-[#111827] hover:shadow-md"
            >
              <div className="absolute right-4 top-4">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Approvals</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {stats.pendingApprovals}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Requires attention</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-3">
                  <AlertCircle size={20} className="text-slate-600" />
                </div>
              </div>
            </Link>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Mentors & Leads</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {stats.mentorsAndLeads}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Active mentors</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-3">
                  <GraduationCap size={20} className="text-slate-600" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Unassigned Judges</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {stats.unassignedJudges}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Need assignment</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-3">
                  <Gavel size={20} className="text-slate-600" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Users by Role - Pie Chart */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900">Users by Role</h3>
          <p className="mb-4 text-sm text-slate-600">Distribution of users across different roles</p>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#111827] border-t-transparent"></div>
            </div>
          ) : stats.usersByRole && stats.usersByRole.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.usersByRole}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name?: string; percent?: number }) => 
                    `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.usersByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p className="text-slate-400">No data available</p>
            </div>
          )}
        </div>

        {/* Users by Status - Bar Chart */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900">Users by Status</h3>
          <p className="mb-4 text-sm text-slate-600">User account status breakdown</p>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#111827] border-t-transparent"></div>
            </div>
          ) : stats.usersByStatus && stats.usersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.usersByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#111827" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p className="text-slate-400">No data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Users Over Time - Line Chart */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900">User Growth</h3>
          <p className="mb-4 text-sm text-slate-600">New user registrations over time</p>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#111827] border-t-transparent"></div>
            </div>
          ) : stats.usersOverTime && stats.usersOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.usersOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#111827" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p className="text-slate-400">No data available</p>
            </div>
          )}
        </div>

        {/* Teams Overview */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900">Teams Overview</h3>
          <p className="mb-4 text-sm text-slate-600">Team statistics and activity</p>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
              <div>
                <p className="text-sm text-slate-600">Total Teams</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {loading ? "..." : stats.teamsCount}
                </p>
              </div>
              <Users size={24} className="text-slate-400" />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
              <div>
                <p className="text-sm text-slate-600">Active Teams</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {loading ? "..." : stats.activeTeams}
                </p>
              </div>
              <Activity size={24} className="text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href={`/${locale}/admin/users`}
          className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-[#111827] hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-[#111827] p-3">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">User Management</h3>
              <p className="mt-1 text-sm text-slate-600">Manage users and approvals</p>
            </div>
          </div>
        </Link>

        <Link
          href={`/${locale}/admin/hackathons`}
          className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-[#111827] hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-[#111827] p-3">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Hackathons</h3>
              <p className="mt-1 text-sm text-slate-600">Manage hackathon events</p>
            </div>
          </div>
        </Link>

        <Link
          href={`/${locale}/admin/teams`}
          className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-[#111827] hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-[#111827] p-3">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Teams</h3>
              <p className="mt-1 text-sm text-slate-600">View and manage teams</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
