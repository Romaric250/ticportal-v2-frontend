"use client";

type LeaderboardRow = {
  id: string;
  name: string;
  score: number;
  rank: number;
};

type Props = {
  title?: string;
  rows?: LeaderboardRow[];
};

const sampleRows: LeaderboardRow[] = [
  { id: "1", name: "Sample Student", score: 1200, rank: 1 },
  { id: "2", name: "Sample Team", score: 900, rank: 2 },
  { id: "3", name: "Another User", score: 750, rank: 3 },
];

export function Leaderboard({ title = "Leaderboard", rows = sampleRows }: Props) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          {title}
        </h2>
      </div>
      <div className="space-y-1.5 text-xs text-slate-200">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 text-[11px] font-semibold text-slate-400">
                #{row.rank}
              </span>
              <span className="font-medium text-slate-100">{row.name}</span>
            </div>
            <span className="text-[11px] font-semibold text-[#111827]">
              {row.score} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


