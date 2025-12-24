import React from "react";

export function StudentNextUpAndTeam() {
  return (
    <>
      <div className="flex flex-col gap-2 text-sm font-semibold text-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <span>Next up for you</span>
        <button className="cursor-pointer text-left text-xs font-medium text-[#111827] hover:underline sm:text-center">
          View all modules
        </button>
        <span className="hidden text-slate-800 sm:inline">My team</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
        {/* Next up card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 md:grid-cols-[220px,minmax(0,1fr)]">
            <div className="relative h-32 rounded-xl bg-slate-100 sm:h-40">
              <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm">
                Academic
              </span>
            </div>
            <div className="flex flex-col justify-between gap-3 text-sm">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-xs text-slate-700">
                    In progress
                  </span>
                  <span>Last accessed 2h ago</span>
                </div>
                <h2 className="text-base font-semibold text-slate-900">
                  Module 3: Design thinking &amp; ideation
                </h2>
                <p className="text-xs text-slate-600 line-clamp-3">
                  Learn how to empathise with users, define problems, and
                  iterate creative solutions for your TIC project.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button className="cursor-pointer rounded-full bg-[#111827] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1f2937]">
                  Resume learning
                </button>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
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

        {/* Team card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex h-full flex-col justify-between gap-3 rounded-xl bg-slate-50 px-4 py-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#111827] to-slate-500 text-base font-semibold text-white">
                CW
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-semibold text-slate-900">
                  Code Warriors
                </p>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Ideation phase · 4 members
                </p>
                <p className="text-xs text-slate-500 line-clamp-2">
                  Focusing on validating their problem statement and preparing
                  for school‑level hackathon submissions.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center -space-x-3">
                <span className="h-10 w-10 rounded-full bg-slate-300 sm:h-12 sm:w-12" />
                <span className="h-10 w-10 rounded-full bg-slate-400 sm:h-12 sm:w-12" />
                <span className="h-10 w-10 rounded-full bg-slate-500 sm:h-12 sm:w-12" />
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-600 shadow-sm sm:h-12 sm:w-12">
                  +2
                </span>
              </div>
              <div className="flex flex-row gap-2 text-xs sm:flex-col">
                <button className="cursor-pointer rounded-full border border-slate-300 px-3 py-1 font-semibold text-[#111827] hover:border-[#111827]">
                  Chat
                </button>
                <button className="cursor-pointer rounded-full border border-slate-300 px-3 py-1 font-semibold text-[#111827] hover:border-[#111827]">
                  Board
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


