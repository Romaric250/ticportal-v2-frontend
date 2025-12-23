"use client";

import { BadgePoints } from "../../../../components/gamification/BadgePoints";
import { Leaderboard } from "../../../../components/gamification/Leaderboard";
import { ConnectionStatus } from "../../../../components/realtime/ConnectionStatus";

export default function StudentDashboardPage() {
  return (
    <div className="space-y-6 text-slate-900">
      {/* Top header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm md:flex-row md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Student Portal
          </p>
          <h1 className="mt-2 text-2xl font-semibold">
            Welcome back, <span className="text-[#111827]">Alex</span> 👋
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            You&apos;re on a 12‑day streak. Keep pushing towards your next badge!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionStatus />
          <button className="rounded-full bg-[#111827] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1f2937]">
            Resume learning
          </button>
        </div>
      </div>

      {/* Top stat cards (4) */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="TIC Points (TP)"
          primary="2,450"
          secondary="+150 today"
        />
        <StatCard title="Current level" primary="Level 4" secondary="Scholar" />
        <StatCard title="Day streak" primary="12" secondary="Days" />
        <LevelProgressCard />
      </div>

      {/* Middle row: Learning Path + My Team */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
        {/* Left: Next Up For You / Learning Path */}
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Next up in your learning path</span>
            <button className="text-[11px] font-medium text-slate-500 hover:text-[#111827]">
              View all modules
            </button>
          </div>

          <div className="mt-2 grid gap-4 md:grid-cols-[220px,minmax(0,1fr)]">
            <div className="h-40 rounded-xl bg-slate-100" />
            <div className="flex flex-col justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-[10px] text-slate-700">
                    In progress
                  </span>
                  <span>Last accessed 2h ago</span>
                </div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Module 3: Design thinking &amp; ideation
                </h2>
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  Learn how to empathise with users, define problems, and
                  iterate creative solutions for your TIC project.
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <button className="rounded-full bg-[#111827] px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-[#1f2937]">
                  Resume learning
                </button>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Progress</span>
                    <span>65%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-2/3 rounded-full bg-[#111827]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: My Team */}
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>My team</span>
            <button className="text-[11px] font-medium text-slate-500 hover:text-[#111827]">
              View all
            </button>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111827] text-sm font-semibold text-white">
              CW
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-slate-900">
                Code Warriors
              </p>
              <p className="text-[10px] text-slate-500">Ideation phase</p>
            </div>
            <div className="flex flex-col gap-1 text-[10px]">
              <button className="rounded-full border border-slate-300 px-3 py-1 font-semibold text-[#111827] hover:border-[#111827]">
                Chat
              </button>
              <button className="rounded-full border border-slate-300 px-3 py-1 font-semibold text-[#111827] hover:border-[#111827]">
                Board
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: three cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Upcoming deadlines */}
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-xs">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
            Upcoming deadlines
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-slate-900">
                  Hackathon registration
                </p>
                <p className="text-[10px] text-rose-500">Due tomorrow</p>
              </div>
              <span className="text-[10px] text-slate-400">Oct 24</span>
            </li>
            <li className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-slate-900">
                  Idea submission
                </p>
                <p className="text-[10px] text-slate-500">Due next week</p>
              </div>
              <span className="text-[10px] text-slate-400">Oct 30</span>
            </li>
            <li className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-slate-900">
                  Mentor check‑in
                </p>
                <p className="text-[10px] text-slate-500">Scheduled</p>
              </div>
              <span className="text-[10px] text-slate-400">Nov 02</span>
            </li>
          </ul>
        </div>

        {/* Recent badges */}
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-xs">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
            Recent badges
          </h2>
          <BadgePoints badgesCount={3} points={1240} />
          <p className="text-[11px] text-slate-500">
            Complete &quot;Prototype Basics&quot; to unlock your next badge.
          </p>
        </div>

        {/* Quick access */}
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-xs">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
            Quick access
          </h2>
          <Leaderboard title="Quick links (sample)" />
        </div>
      </div>
    </div>
  );
}

type StatCardProps = {
  title: string;
  primary: string;
  secondary: string;
};

function StatCard({ title, primary, secondary }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-xs shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <div className="mt-3 flex flex-col gap-1">
        <span className="text-2xl font-bold text-slate-900">{primary}</span>
        <span className="text-[11px] text-slate-500">{secondary}</span>
      </div>
    </div>
  );
}

function LevelProgressCard() {
  return (
    <div className="rounded-xl bg-[#111827] px-4 py-4 text-xs text-slate-50 shadow-md">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
        Level 5 progress
      </p>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-white">85%</span>
        <span className="text-[10px] text-slate-300">
          Only 50 TP more to reach Level 5 and unlock your next badge.
        </span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
        <div className="h-full w-11/12 rounded-full bg-white" />
      </div>
    </div>
  );
}
