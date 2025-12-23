import React from "react";
import { BadgePoints } from "../../../components/gamification/BadgePoints";
import { QuickAccessTile } from "./StudentQuickAccessTile";
import { UpcomingDeadlineItem } from "./StudentUpcomingDeadlineItem";

export function StudentBottomRow() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Upcoming deadlines */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
            Upcoming deadlines
          </h2>
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-[11px] text-slate-600">
            📅
          </div>
        </div>
        <ul className="space-y-3">
          <UpcomingDeadlineItem
            variant="danger"
            title="Hackathon registration"
            subtitle="Due tomorrow"
            date="Oct 24"
          />
          <UpcomingDeadlineItem
            variant="info"
            title="Idea submission"
            subtitle="Due next week"
            date="Oct 30"
          />
          <UpcomingDeadlineItem
            variant="purple"
            title="Mentor check‑in"
            subtitle="Scheduled"
            date="Nov 02"
          />
        </ul>
      </div>

      {/* Recent badges */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
            Recent badges
          </h2>
          <button className="text-[11px] font-medium text-[#111827] hover:underline">
            View all
          </button>
        </div>

        <div className="flex gap-2">
          <div className="flex h-14 w-16 flex-col items-center justify-center rounded-xl bg-amber-50 text-[10px] font-semibold text-amber-700">
            <span className="text-lg">★</span>
            <span>Early bird</span>
          </div>
          <div className="flex h-14 w-16 flex-col items-center justify-center rounded-xl bg-sky-50 text-[10px] font-semibold text-sky-700">
            <span className="text-lg">👥</span>
            <span>Team player</span>
          </div>
          <div className="flex h-14 w-16 flex-col items-center justify-center rounded-xl bg-slate-50 text-[10px] font-semibold text-slate-400">
            <span className="text-lg">🔒</span>
            <span>Code master</span>
          </div>
        </div>

        <BadgePoints badgesCount={3} points={1240} />
      </div>

      {/* Quick access */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
          Quick access
        </h2>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <QuickAccessTile icon="💡" label="Hackathon" />
          <QuickAccessTile icon="📚" label="Resources" />
          <QuickAccessTile icon="📅" label="Calendar" />
          <QuickAccessTile icon="❓" label="Support" />
        </div>
      </div>
    </div>
  );
}


