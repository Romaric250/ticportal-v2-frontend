"use client";

import { useState } from "react";
import { ReviewerManagement } from "../../../../../components/grading/ReviewerManagement";
import { TeamAssignment } from "../../../../../components/grading/TeamAssignment";
import { RubricEditor } from "../../../../../components/grading/RubricEditor";
import { AdminGradingView } from "../../../../../components/grading/AdminGradingView";
import { LeaderboardConfig } from "../../../../../components/grading/LeaderboardConfig";
import { GradingReport } from "../../../../../components/grading/GradingReport";
import { GradingTeamsList } from "../../../../../components/grading/GradingTeamsList";
import { cn } from "../../../../../src/utils/cn";

const tabs = [
  { id: "reviewers", label: "Reviewers" },
  { id: "teams", label: "Teams" },
  { id: "assign", label: "Assignments" },
  { id: "rubric", label: "Rubric" },
  { id: "grades", label: "Finalize" },
  { id: "settings", label: "Settings" },
  { id: "report", label: "Reports" },
] as const;

export default function AdminJudgingPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("reviewers");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Judging & grading</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage reviewers, assignments, rubric, final scores; configure leaderboard blend under Settings; live ranking and
          filters under Reports.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.id ? "bg-[#111827] text-white" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-[320px]">
        {tab === "reviewers" && <ReviewerManagement />}
        {tab === "teams" && <GradingTeamsList />}
        {tab === "assign" && <TeamAssignment />}
        {tab === "rubric" && <RubricEditor />}
        {tab === "grades" && <AdminGradingView />}
        {tab === "settings" && <LeaderboardConfig />}
        {tab === "report" && <GradingReport />}
      </div>
    </div>
  );
}
