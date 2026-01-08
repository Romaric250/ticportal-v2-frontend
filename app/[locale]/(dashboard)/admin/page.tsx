"use client";

import { useEffect, useState } from "react";
import { Users, AlertCircle, GraduationCap, Gavel, TrendingUp, Activity } from "lucide-react";
import { adminService } from "../../../../src/lib/services/adminService";
import { toast } from "sonner";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function AdminDashboardPage() {
  const locale = useLocale();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    mentorsAndLeads: 0,
    unassignedJudges: 0,
    totalUsersChange: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const statsData = await adminService.getStats();
        setStats(statsData);
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
        <Link
          href={`/${locale}/admin/users`}
          className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-[#111827] hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Users</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {loading ? "..." : stats.totalUsers.toLocaleString()}
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
                {loading ? "..." : stats.pendingApprovals}
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
                {loading ? "..." : stats.mentorsAndLeads}
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
                {loading ? "..." : stats.unassignedJudges}
              </p>
              <p className="mt-1 text-xs text-slate-500">Need assignment</p>
            </div>
            <div className="rounded-lg bg-slate-100 p-3">
              <Gavel size={20} className="text-slate-600" />
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


