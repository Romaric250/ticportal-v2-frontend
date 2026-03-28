/** Static placeholders only — no pulse animation (easier on the eyes). */

/** Table skeleton for Judging admin lists (reports, teams, finalize). */
export function JudgingTableSkeleton({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-3 py-2.5">
                <div className="h-3 w-16 rounded bg-slate-200/90" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="px-3 py-3">
                  <div
                    className={`h-4 rounded bg-slate-100 ${c === 0 ? "w-10" : c === cols - 1 ? "ml-auto w-16" : "w-24"}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GradingListSkeleton() {
  return (
    <div className="w-full space-y-8">
      <div className="rounded-xl border border-slate-800 bg-[#111827] px-4 py-4 md:px-5 md:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="min-w-0 space-y-2">
            <div className="h-2.5 w-16 rounded bg-slate-600/70" />
            <div className="h-5 w-40 rounded bg-slate-500/50" />
            <div className="h-3.5 w-56 max-w-full rounded bg-slate-600/50" />
          </div>
          <div className="flex flex-wrap gap-6 border-t border-slate-700/80 pt-3 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-2.5 w-14 rounded bg-slate-600/60" />
                <div className="h-6 w-8 rounded bg-slate-500/40" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="px-4 pt-4">
          <div className="h-4 w-36 rounded bg-slate-200/90" />
          <div className="mt-0.5 h-3 w-64 max-w-full rounded bg-slate-100" />
        </div>
        <ul className="mt-4 grid grid-cols-1 gap-3 px-4 pb-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <li key={i} className="flex min-w-0">
              <div className="flex w-full flex-col rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex flex-1 flex-col gap-3">
                  <div className="space-y-2 border-l-[3px] border-[#111827] pl-2.5">
                    <div className="h-2 w-14 rounded bg-slate-200" />
                    <div className="h-4 w-full max-w-[11rem] rounded bg-slate-200/90" />
                    <div className="h-3 max-w-[10rem] rounded bg-slate-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-x-3">
                    <div className="space-y-1">
                      <div className="h-2 w-10 rounded bg-slate-200" />
                      <div className="h-4 w-16 rounded bg-slate-100" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 w-16 rounded bg-slate-200" />
                      <div className="h-4 w-6 rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="h-2 w-20 rounded bg-slate-200" />
                      <div className="mt-1 h-3.5 max-w-[10rem] rounded bg-slate-100" />
                    </div>
                    <div className="flex h-9 items-center justify-center rounded-md bg-slate-700/50">
                      <div className="h-3 w-16 rounded bg-slate-500/50" />
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function GradingFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="h-1 bg-[#111827]" aria-hidden />
        <div className="p-3 md:p-4">
          <div className="flex flex-col gap-3">
            <div className="space-y-2 border-l-[3px] border-[#111827] pl-2.5">
              <div className="h-2 w-20 rounded bg-slate-200" />
              <div className="h-6 w-52 max-w-full rounded bg-slate-200/90" />
              <div className="h-3.5 w-40 rounded bg-slate-100" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="h-2 w-12 rounded bg-slate-200" />
                <div className="h-4 w-20 rounded bg-slate-100" />
              </div>
              <div className="space-y-1">
                <div className="h-2 w-16 rounded bg-slate-200" />
                <div className="h-4 w-6 rounded bg-slate-100" />
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="h-2 w-24 rounded bg-slate-200" />
              <div className="mt-1 h-3.5 w-32 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-100/90 p-4 md:p-5">
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
          <div className="mb-2 h-2 w-16 rounded bg-slate-200" />
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-1.5 flex-1 rounded-full bg-slate-200/90" />
            ))}
          </div>
        </div>
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="h-10 bg-slate-700/80" />
          <div className="grid gap-0 bg-slate-100/60 lg:grid-cols-2 lg:divide-x lg:divide-slate-200">
            <div className="h-28 border-b border-slate-200 p-4 lg:border-b-0">
              <div className="h-full rounded-lg bg-slate-100" />
            </div>
            <div className="space-y-3 bg-slate-50 p-4">
              <div className="h-20 rounded-lg border border-slate-200 bg-white" />
              <div className="h-20 rounded-lg border border-slate-200 bg-white" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
          <div className="h-10 w-24 rounded-lg bg-slate-100" />
          <div className="h-10 w-36 rounded-lg bg-slate-200/80" />
        </div>
      </div>
    </div>
  );
}
