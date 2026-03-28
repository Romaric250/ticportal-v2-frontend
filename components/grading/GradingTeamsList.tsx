"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { Search } from "lucide-react";
import { adminService, type Team, type TeamDeliverable } from "../../src/lib/services/adminService";
import { JudgingTableSkeleton } from "./grading-skeletons";

function DeliverableBadge({ submitted, total }: { submitted: number; total: number }) {
  if (total <= 0) {
    return <span className="text-slate-400">—</span>;
  }
  const complete = submitted === total;
  return (
    <span
      className={`font-medium tabular-nums ${complete ? "text-emerald-700" : "text-amber-700"}`}
      title="Required deliverables submitted / required total"
    >
      {submitted}/{total}
    </span>
  );
}

function JudgesBadge({ count }: { count?: number }) {
  if (count == null || count === 0) {
    return <span className="text-slate-400">—</span>;
  }
  if (count >= 2) {
    return (
      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-800">Pair (2)</span>
    );
  }
  return (
    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-900">{count} judge</span>
  );
}

export function GradingTeamsList() {
  const [q, setQ] = useState("");
  const [debounced] = useDebounce(q, 350);
  const [page, setPage] = useState(1);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewTeam, setViewTeam] = useState<Team | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getTeams(page, 20, {
        search: debounced.trim().length >= 2 ? debounced.trim() : undefined,
      });
      setTeams(res.teams ?? []);
      const p = res.pagination;
      if (p) {
        setHasNextPage(p.hasNextPage);
        setHasPrevPage(p.hasPrevPage);
      }
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: string }).message)
          : "Failed to load teams";
      setError(msg);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [debounced, page]);

  useEffect(() => {
    load();
  }, [load]);

  const openView = async (row: Team) => {
    setViewTeam(row);
    setDetailLoading(true);
    try {
      const full = await adminService.getTeam(row.id);
      setViewTeam(full);
    } catch {
      setViewTeam(row);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setViewTeam(null);
  };

  const requiredDeliverables = (viewTeam?.deliverables ?? []).filter(
    (d) => !d.template || d.template.required !== false
  );
  const submittedRequired = requiredDeliverables.filter((d) => d.submissionStatus === "SUBMITTED").length;
  const totalRequired = requiredDeliverables.length;

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          placeholder="Search by team name or project (min. 2 characters)…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
      </div>
      <p className="text-xs text-slate-500">
        Use <strong className="font-medium text-slate-700">Assignments</strong> to assign reviewers. “Judges” shows how
        many reviewer slots are filled (2 = full pair).
      </p>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p>{error}</p>
          <button type="button" className="mt-2 text-sm font-medium text-red-900 underline" onClick={() => load()}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <JudgingTableSkeleton rows={6} cols={7} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-black text-xs font-semibold uppercase tracking-wide text-white">
              <tr>
                <th className="px-3 py-2.5">Team</th>
                <th className="hidden px-3 py-2.5 md:table-cell">School</th>
                <th className="hidden px-3 py-2.5 lg:table-cell">Project</th>
                <th className="px-3 py-2.5">Members</th>
                <th className="px-3 py-2.5">Deliverables</th>
                <th className="px-3 py-2.5">Judges</th>
                <th className="px-3 py-2.5 text-right"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teams.length === 0 && !error ? (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-slate-500">
                    No teams found.
                  </td>
                </tr>
              ) : (
                teams.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-900">{t.name}</td>
                    <td className="hidden max-w-[140px] truncate px-3 py-2 text-slate-600 md:table-cell">
                      {t.school}
                    </td>
                    <td className="hidden max-w-[160px] truncate px-3 py-2 text-slate-600 lg:table-cell">
                      {t.projectTitle ?? "—"}
                    </td>
                    <td className="px-3 py-2 tabular-nums text-slate-700">
                      {t.memberCount ?? t.members?.length ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      <DeliverableBadge
                        submitted={t.deliverableSubmitted ?? 0}
                        total={t.deliverableTotal ?? 0}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <JudgesBadge count={t.reviewerAssignmentCount} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        className="text-sm font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:text-slate-950"
                        onClick={() => openView(t)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {(hasNextPage || hasPrevPage) && !loading && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={!hasPrevPage}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">Page {page}</span>
          <button
            type="button"
            disabled={!hasNextPage}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 disabled:opacity-40"
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {viewTeam && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-900">{viewTeam.name}</h3>
              <button
                type="button"
                className="text-slate-500 hover:text-slate-800"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {detailLoading && <p className="mt-4 text-sm text-slate-500">Loading details…</p>}

            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase text-slate-500">School</dt>
                <dd className="text-slate-900">{viewTeam.school}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-500">Project</dt>
                <dd className="text-slate-900">{viewTeam.projectTitle ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-500">Description</dt>
                <dd className="whitespace-pre-wrap text-slate-700">
                  {viewTeam.description?.trim() ? viewTeam.description : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-500">Required deliverables</dt>
                <dd>
                  {totalRequired > 0 ? (
                    <span
                      className={`font-medium tabular-nums ${submittedRequired === totalRequired ? "text-emerald-700" : "text-amber-700"}`}
                    >
                      {submittedRequired}/{totalRequired} submitted
                    </span>
                  ) : (
                    <span className="text-slate-500">No required deliverable rows</span>
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase text-slate-500">Members</h4>
              {!viewTeam.members?.length ? (
                <p className="mt-2 text-sm text-slate-500">—</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm">
                  {viewTeam.members.map((m) => (
                    <li key={m.id} className="text-slate-800">
                      <span className="font-medium">
                        {m.user?.firstName} {m.user?.lastName}
                      </span>
                      {m.user?.email && <span className="text-slate-500"> · {m.user.email}</span>}
                      <span className="text-slate-400"> · {m.role}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase text-slate-500">Deliverables</h4>
              {!viewTeam.deliverables?.length ? (
                <p className="mt-2 text-sm text-slate-500">None</p>
              ) : (
                <ul className="mt-2 space-y-3 text-sm">
                  {(viewTeam.deliverables as TeamDeliverable[]).map((d) => (
                    <li key={d.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                      <div className="font-medium text-slate-900">{d.template?.title ?? "Deliverable"}</div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span
                          className={
                            d.submissionStatus === "SUBMITTED"
                              ? "rounded bg-emerald-100 px-1.5 py-0.5 font-medium text-emerald-900"
                              : "rounded bg-slate-200 px-1.5 py-0.5"
                          }
                        >
                          {d.submissionStatus === "SUBMITTED" ? "Submitted" : "Not submitted"}
                        </span>
                        {d.template?.required === false && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5">Optional</span>
                        )}
                        {d.reviewStatus && (
                          <span className="rounded bg-white px-1.5 py-0.5 ring-1 ring-slate-200">
                            Review: {d.reviewStatus}
                          </span>
                        )}
                      </div>
                      {d.submissionStatus === "SUBMITTED" && d.content && (
                        <p className="mt-2 break-all text-xs text-slate-600">
                          {d.contentType === "FILE" || d.content?.startsWith("http") ? (
                            <a href={d.content} className="text-sky-700 hover:underline" target="_blank" rel="noreferrer">
                              {d.content}
                            </a>
                          ) : (
                            d.content
                          )}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
