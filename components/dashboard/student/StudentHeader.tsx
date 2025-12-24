import React from "react";

export function StudentHeader() {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5 md:flex-row md:items-center border-l-4 border-l-[#111827]">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Student Portal
        </p>
        <h1 className="mt-2 text-xl font-semibold sm:text-2xl">
          Welcome back, <span className="text-[#111827]">Alex</span> 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          You&apos;re on a 12‑day streak. Keep pushing towards your next badge!
        </p>
      </div>
      <div className="flex items-center justify-end gap-3">
        <button className="cursor-pointer rounded-full bg-[#111827] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1f2937]">
          Resume learning
        </button>
      </div>
    </div>
  );
}


