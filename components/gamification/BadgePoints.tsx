"use client";

type Props = {
  badgesCount?: number;
  points?: number;
};

export function BadgePoints({ badgesCount = 0, points = 0 }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-slate-200">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-semibold text-amber-300">
          ★
        </span>
        <div className="flex flex-col">
          <span className="font-semibold">{points}</span>
          <span className="text-[11px] text-slate-400">Points</span>
        </div>
      </div>
      <div className="h-8 w-px bg-slate-800" />
      <div className="flex flex-col">
        <span className="font-semibold">{badgesCount}</span>
        <span className="text-[11px] text-slate-400">Badges</span>
      </div>
    </div>
  );
}


