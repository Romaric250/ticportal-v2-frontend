"use client";

import { useEffect, useState } from "react";
import { Users, AlertCircle, GraduationCap, Gavel, TrendingUp, Activity, Loader2 } from "lucide-react";
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

const THEME = "#111827";
const CHART_COLORS = ["#111827", "#475569", "#64748b", "#94a3b8", "#cbd5e1"];

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
        const [statsData, dashboardStats] = await Promise.all([
          adminService.getStats().catch((err) => {
            console.error("Error fetching stats:", err);
            return null;
          }),
          adminService.getDashboardStats().catch((err) => {
            console.error("Error fetching dashboard stats:", err);
            return null;
          }),
        ]);
        
        console.log("=== RAW API RESPONSES ===");
        console.log("Stats data:", statsData);
        console.log("Dashboard stats:", dashboardStats);
        console.log("Dashboard stats type:", typeof dashboardStats);
        console.log("Dashboard stats keys:", dashboardStats ? Object.keys(dashboardStats) : "null");
        
        // Extract chart data with proper fallbacks - handle both direct and nested structures
        let usersByRole: { role: string; count: number }[] = [];
        let usersByStatus: { status: string; count: number }[] = [];
        let usersOverTime: { date: string; users: number }[] = [];
        let teamsCount = 0;
        let activeTeams = 0;
        
        if (dashboardStats) {
          // Handle direct structure
          if (Array.isArray(dashboardStats.usersByRole)) {
            usersByRole = dashboardStats.usersByRole;
          }
          if (Array.isArray(dashboardStats.usersByStatus)) {
            usersByStatus = dashboardStats.usersByStatus;
          }
          if (Array.isArray(dashboardStats.usersOverTime)) {
            usersOverTime = dashboardStats.usersOverTime;
          }
          if (typeof dashboardStats.teamsCount === 'number') {
            teamsCount = dashboardStats.teamsCount;
          }
          if (typeof dashboardStats.activeTeams === 'number') {
            activeTeams = dashboardStats.activeTeams;
          }
        }
        
        console.log("=== PROCESSED ARRAYS ===");
        console.log("usersByRole:", usersByRole);
        console.log("usersByStatus:", usersByStatus);
        console.log("usersOverTime:", usersOverTime);
        console.log("usersByRole.length:", usersByRole.length);
        console.log("usersByStatus.length:", usersByStatus.length);
        console.log("usersOverTime.length:", usersOverTime.length);
        
        const mergedStats: DashboardStats = {
          totalUsers: statsData?.totalUsers ?? 0,
          pendingApprovals: statsData?.pendingApprovals ?? 0,
          mentorsAndLeads: statsData?.mentorsAndLeads ?? 0,
          unassignedJudges: statsData?.unassignedJudges ?? 0,
          totalUsersChange: statsData?.totalUsersChange ?? 0,
          usersByRole,
          usersByStatus,
          usersOverTime,
          teamsCount,
          activeTeams,
        };
        
        console.log("=== FINAL MERGED STATS ===");
        console.log("Merged stats:", mergedStats);
        console.log("usersByRole check:", mergedStats.usersByRole?.length > 0);
        console.log("usersByStatus check:", mergedStats.usersByStatus?.length > 0);
        console.log("usersOverTime check:", mergedStats.usersOverTime?.length > 0);
        
        // Force state update
        setStats(mergedStats);
        
        // Verify state was set
        setTimeout(() => {
          console.log("State after update:", mergedStats);
        }, 100);
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
    <div className="min-w-0 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-xs text-slate-500">
          Overview of users, teams, and system activity
        </p>
      </div>

      {/* Key Metrics - Black Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-3 w-20 animate-pulse rounded bg-slate-200"></div>
                    <div className="mt-2 h-6 w-16 animate-pulse rounded bg-slate-200"></div>
                  </div>
                  <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200"></div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <Link
              href={`/${locale}/admin/users`}
              className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-600">Total Users</p>
                  <p className="mt-1.5 text-xl font-bold text-slate-900">
                    {(stats.totalUsers ?? 0).toLocaleString()}
                  </p>
                  {stats.totalUsersChange && (
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      <span className="text-slate-900">+{stats.totalUsersChange}%</span> from last period
                    </p>
                  )}
                </div>
                <div className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 transition-transform group-hover:scale-105">
                  <Users size={18} className="text-white" />
                </div>
              </div>
            </Link>

            <Link
              href={`/${locale}/admin/users?status=PENDING`}
              className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="absolute right-3 top-3">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
              </div>
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-600">Pending Approvals</p>
                  <p className="mt-1.5 text-xl font-bold text-slate-900">
                    {stats.pendingApprovals ?? 0}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Requires attention</p>
                </div>
                <div className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 transition-transform group-hover:scale-105">
                  <AlertCircle size={18} className="text-amber-600" />
                </div>
              </div>
            </Link>

            <div className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-600">Mentors & Leads</p>
                  <p className="mt-1.5 text-xl font-bold text-slate-900">
                    {stats.mentorsAndLeads ?? 0}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Active mentors</p>
                </div>
                <div className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 transition-transform group-hover:scale-105">
                  <GraduationCap size={18} className="text-white" />
                </div>
              </div>
            </div>

            <div className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-600">Unassigned Judges</p>
                  <p className="mt-1.5 text-xl font-bold text-slate-900">
                    {stats.unassignedJudges ?? 0}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Need assignment</p>
                </div>
                <div className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 transition-transform group-hover:scale-105">
                  <Gavel size={18} className="text-white" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Users by Role - Pie Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Users by Role</h3>
            <p className="mt-0.5 text-xs text-slate-500">Distribution across different roles</p>
          </div>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="animate-spin text-slate-400" size={24} />
            </div>
          ) : (stats.usersByRole?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={280} key={`pie-${stats.usersByRole?.length}`}>
              <PieChart>
                <Pie
                  data={stats.usersByRole}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, percent }: { role?: string; percent?: number }) => 
                    `${role ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="role"
                >
                  {stats.usersByRole?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: any, name: any, props: any) => [
                    `${value} users`,
                    props?.payload?.role || name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p className="text-xs text-slate-400">
                No data available {stats.usersByRole?.length !== undefined && `(${stats.usersByRole.length} items)`}
              </p>
            </div>
          )}
        </div>

        {/* Users by Status - Bar Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Users by Status</h3>
            <p className="mt-0.5 text-xs text-slate-500">Account status breakdown</p>
          </div>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="animate-spin text-slate-400" size={24} />
            </div>
          ) : (stats.usersByStatus?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={280} key={`bar-${stats.usersByStatus?.length}`}>
              <BarChart data={stats.usersByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="status" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  stroke="#cbd5e1"
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  stroke="#cbd5e1"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [`${value} users`, 'Count']}
                />
                <Bar dataKey="count" fill={THEME} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p className="text-xs text-slate-400">
                No data available {stats.usersByStatus?.length !== undefined && `(${stats.usersByStatus.length} items)`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Growth & Teams */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Users Over Time - Line Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">User Growth</h3>
            <p className="mt-0.5 text-xs text-slate-500">New registrations over time</p>
          </div>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="animate-spin text-slate-400" size={24} />
            </div>
          ) : (stats.usersOverTime?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={280} key={`line-${stats.usersOverTime?.length}`}>
              <LineChart data={stats.usersOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  stroke="#cbd5e1"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  stroke="#cbd5e1"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [`${value} users`, 'Users']}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke={THEME} 
                  strokeWidth={2}
                  dot={{ fill: THEME, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Users"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p className="text-xs text-slate-400">
                No data available {stats.usersOverTime?.length !== undefined && `(${stats.usersOverTime.length} items)`}
              </p>
            </div>
          )}
        </div>

        {/* Teams Overview - Black Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Teams Overview</h3>
            <p className="mt-0.5 text-xs text-slate-500">Team statistics and activity</p>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-900 p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-white/80">Total Teams</p>
                  <p className="mt-1.5 text-2xl font-bold">
                    {loading ? "..." : (stats.teamsCount ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                  <Users size={20} />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-600">Active Teams</p>
                  <p className="mt-1.5 text-xl font-bold text-slate-900">
                    {loading ? "..." : (stats.activeTeams ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
                  <Activity size={18} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
