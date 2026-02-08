"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { StudentHeader } from "../../../../components/dashboard/student/StudentHeader";
import { StudentStatsRow } from "../../../../components/dashboard/student/StudentStatsRow";
import { StudentNextUpAndTeam } from "../../../../components/dashboard/student/StudentNextUpAndTeam";
import { StudentBottomRow } from "../../../../components/dashboard/student/StudentBottomRow";
import { dashboardService, type DashboardOverview } from "../../../../src/lib/services/dashboardService";

export default function StudentDashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const overview = await dashboardService.getOverview();
      setData(overview);
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setError(err?.response?.data?.message || "Failed to load dashboard data");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#111827]" />
          <p className="text-sm text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-medium text-red-600">{error || "Failed to load dashboard"}</p>
          <button
            onClick={loadDashboardData}
            className="rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2937]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-slate-900">
      <StudentHeader user={data.user} stats={data.stats} />
      <StudentStatsRow stats={data.stats} />
      <StudentNextUpAndTeam nextUp={data.nextUp} team={data.team} />
      <StudentBottomRow deadlines={data.upcomingDeadlines} badges={data.recentBadges} badgeStats={data.badgeStats} />
    </div>
  );
}
