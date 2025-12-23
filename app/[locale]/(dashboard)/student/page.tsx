"use client";

import { BadgePoints } from "../../../../components/gamification/BadgePoints";
import { Leaderboard } from "../../../../components/gamification/Leaderboard";
import { ConnectionStatus } from "../../../../components/realtime/ConnectionStatus";

export default function StudentDashboardPage() {
  return (
    <div className="space-y-6 text-slate-900">
      {/* Greeting */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-md md:flex-row md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Student Portal
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Welcome back, <span className="text-[#111827]">Alex</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Let&apos;s continue your innovation journey. You&apos;re doing great.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionStatus />
          <button className="rounded-full bg-[#111827] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1f2937]">
            Resume learning
          </button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Total XP
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">1,240</span>
            <span className="text-[11px] text-[#111827]">+120 this week</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Current level
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">Level 5</span>
            <span className="text-[11px] text-slate-500">Top 15%</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Next badge
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">Innovator</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">200 XP to go</p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
        {/* Left column */}
        <div className="space-y-5">
          {/* Current phase card */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Current phase
                </p>
                <h2 className="mt-1 text-sm font-semibold">
                  Market Research
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  Module 3 of 8 · Due Oct 24th
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-500">Progress</p>
                <p className="text-xl font-semibold text-[#111827]">75%</p>
              </div>
            </div>

            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-3/4 rounded-full bg-[#111827]" />
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
              <span>Start</span>
              <span>Research</span>
              <span className="text-[#111827]">Validation</span>
              <span>Prototype</span>
              <span>Pitch</span>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div>
                <p className="text-[11px] text-slate-500">Up next</p>
                <p className="text-sm font-semibold">
                  Competitor analysis · 15 mins
                </p>
              </div>
              <button className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-[#111827] hover:border-[#111827]">
                Continue
              </button>
            </div>
          </div>

          {/* Team activity */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Team activity
              </h2>
              <button className="text-[11px] font-medium text-slate-500 hover:text-[#111827]">
                View all
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <ActivityItem
                name="Sarah J."
                action="uploaded a file"
                timeAgo="2h ago"
                detail="financial_model_v1.xlsx"
              />
              <ActivityItem
                name="Mike T."
                action="commented on Ideation Board"
                timeAgo="4h ago"
                detail="“I think we should pivot to the mobile‑first approach...”"
              />
              <ActivityItem
                name="You"
                action="posted an update to your team"
                timeAgo="6h ago"
              />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Upcoming */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Upcoming
            </h2>
            <div className="space-y-3 text-xs">
              <UpcomingItem
                day="24"
                month="OCT"
                title="Market research"
                subtitle="Due in 2 days"
              />
              <UpcomingItem
                day="30"
                month="OCT"
                title="User personas"
                subtitle="Upcoming"
              />
              <UpcomingItem
                day="05"
                month="NOV"
                title="Initial pitch"
                subtitle="Upcoming"
              />
            </div>
          </div>

          {/* Leaderboard + points */}
          <div className="space-y-3 rounded-2xl bg-[#111827] p-5 shadow-lg shadow-black/40">
            <BadgePoints badgesCount={3} points={1240} />
            <Leaderboard title="Leaderboard (sample)" />
          </div>
        </div>
      </div>
    </div>
  );
}

type ActivityProps = {
  name: string;
  action: string;
  timeAgo: string;
  detail?: string;
};

function ActivityItem({ name, action, timeAgo, detail }: ActivityProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
      <div>
        <p className="text-[11px]">
          <span className="font-semibold text-slate-900">{name}</span>{" "}
          <span className="text-slate-600">{action}</span>
        </p>
        {detail && (
          <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
            {detail}
          </p>
        )}
      </div>
      <span className="text-[10px] text-slate-400">{timeAgo}</span>
    </div>
  );
}

type UpcomingProps = {
  day: string;
  month: string;
  title: string;
  subtitle: string;
};

function UpcomingItem({ day, month, title, subtitle }: UpcomingProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
      <div className="flex flex-col items-center justify-center rounded-lg bg-[#111827] px-2 py-1 text-[10px] font-semibold text-white">
        <span>{month}</span>
        <span className="text-base">{day}</span>
      </div>
      <div className="flex-1">
        <p className="text-[11px] font-semibold text-slate-900">{title}</p>
        <p className="text-[10px] text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

