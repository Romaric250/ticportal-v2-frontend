"use client";

import { StudentHeader } from "../../../../components/dashboard/student/StudentHeader";
import { StudentStatsRow } from "../../../../components/dashboard/student/StudentStatsRow";
import { StudentNextUpAndTeam } from "../../../../components/dashboard/student/StudentNextUpAndTeam";
import { StudentBottomRow } from "../../../../components/dashboard/student/StudentBottomRow";

export default function StudentDashboardPage() {
  return (
    <div className="space-y-6 text-slate-900">
      <StudentHeader />
      <StudentStatsRow />
      <StudentNextUpAndTeam />
      <StudentBottomRow />
    </div>
  );
}
