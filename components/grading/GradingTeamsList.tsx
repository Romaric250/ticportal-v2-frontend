"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { FileDown, Search } from "lucide-react";
import { toast } from "sonner";
import { adminService, type Team, type TeamDeliverable } from "../../src/lib/services/adminService";
import { exportTeamsPdfByRegion } from "../../src/utils/exportToPdf";
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

const DELIVERABLES_COMPLETE_TARGET = 7;

function isAllRequiredDeliverablesComplete(t: Team): boolean {
  const sub = t.deliverableSubmitted ?? 0;
  const tot = t.deliverableTotal ?? 0;
  return tot >= DELIVERABLES_COMPLETE_TARGET && sub === tot;
}

function JudgesBadge({ count }: { count?: number }) {
  if (count == null || count === 0) {
    return <span className="text-slate-400">—</span>;
  }
  if (count >= 3) {
    return (
      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-800">Panel (3)</span>
    );
  }
  return (
    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-900">
      {count} judge{count !== 1 ? "s" : ""}
    </span>
  );
}

function isTeamDeliverablesComplete(t: Team): boolean {
  const tot = t.deliverableTotal ?? 0;
  const sub = t.deliverableSubmitted ?? 0;
  return tot >= DELIVERABLES_COMPLETE_TARGET && sub === tot && tot > 0;
}

/** Client-only: teams with all required deliverables submitted first (no extra server work). */
function sortTeamsCompleteFirst(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => {
    const ca = isTeamDeliverablesComplete(a);
    const cb = isTeamDeliverablesComplete(b);
    if (ca !== cb) return ca ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function GradingTeamsList() {
  const [q, setQ] = useState("");
  const [debounced] = useDebounce(q, 350);
  const [regionSelect, setRegionSelect] = useState("");
  const [schoolSelect, setSchoolSelect] = useState("");
  /** Reorder rows in the browser only — server returns stable DB order. */
  const [prioritizeCompleteSubmissions, setPrioritizeCompleteSubmissions] = useState(false);
  /** Server filter: 0 = any. */
  const [minDeliverablesSubmitted, setMinDeliverablesSubmitted] = useState(0);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewTeam, setViewTeam] = useState<Team | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [regionListFromStats, setRegionListFromStats] = useState<string[]>([]);
  const [schoolsFromApi, setSchoolsFromApi] = useState<string[]>([]);

  /** Teams chosen for PDF export (cleared when filters change). */
  const [selectedForExport, setSelectedForExport] = useState<Record<string, Team>>({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportExcludeReviewers, setExportExcludeReviewers] = useState(false);

  /** Load region/school dropdown data only after teams succeed — avoids hammering MongoDB in parallel with the teams query. */
  const filterDropdownsLoadedRef = useRef(false);

  useEffect(() => {
    setSelectedForExport({});
  }, [debounced, regionSelect, schoolSelect, minDeliverablesSubmitted]);

  const regionDropdownOptions = useMemo(() => {
    const s = new Set<string>(regionListFromStats);
    for (const t of teams) {
      const r = t.region?.trim();
      if (r) s.add(r);
    }
    if (regionSelect.trim()) s.add(regionSelect.trim());
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [regionListFromStats, teams, regionSelect]);

  const schoolDropdownOptions = useMemo(() => {
    const s = new Set<string>(schoolsFromApi);
    for (const t of teams) {
      const sch = t.school?.trim();
      if (sch) s.add(sch);
    }
    if (schoolSelect.trim()) s.add(schoolSelect.trim());
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [schoolsFromApi, teams, schoolSelect]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const filters = {
      search: debounced.trim().length >= 2 ? debounced.trim() : undefined,
      region: regionSelect.trim() || undefined,
      school: schoolSelect.trim() || undefined,
      minDeliverablesSubmitted: minDeliverablesSubmitted >= 1 ? minDeliverablesSubmitted : undefined,
    };
    /** One request — enough for typical cohorts; backend caps `limit`. */
    const fetchLimit = 80;
    try {
      const res = await adminService.getTeams(1, fetchLimit, {
        ...filters,
        includeDeliverableStats: true,
      });
      setTeams(res.teams ?? []);
      if (!filterDropdownsLoadedRef.current) {
        filterDropdownsLoadedRef.current = true;
        void adminService
          .getUsersByRegionStats()
          .then((rows) => {
            const names = rows.map((x) => x.region?.trim()).filter((x): x is string => Boolean(x));
            setRegionListFromStats([...new Set(names)].sort((a, b) => a.localeCompare(b)));
          })
          .catch(() => setRegionListFromStats([]));
        void adminService
          .getDistinctTeamSchools()
          .then((list) => setSchoolsFromApi(list))
          .catch(() => setSchoolsFromApi([]));
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
  }, [debounced, regionSelect, schoolSelect, minDeliverablesSubmitted]);

  useEffect(() => {
    load();
  }, [load]);

  const displayTeams = useMemo(
    () => (prioritizeCompleteSubmissions ? sortTeamsCompleteFirst(teams) : teams),
    [teams, prioritizeCompleteSubmissions]
  );

  const selectedExportCount = Object.keys(selectedForExport).length;

  const toggleExportSelect = (t: Team) => {
    setSelectedForExport((s) => {
      const next = { ...s };
      if (next[t.id]) delete next[t.id];
      else next[t.id] = t;
      return next;
    });
  };

  const selectAllOnPageForExport = () => {
    setSelectedForExport((s) => {
      const next = { ...s };
      for (const t of teams) next[t.id] = t;
      return next;
    });
  };

  const deselectAllOnPageForExport = () => {
    setSelectedForExport((s) => {
      const next = { ...s };
      for (const t of teams) delete next[t.id];
      return next;
    });
  };

  const openExportModal = () => {
    const list = Object.values(selectedForExport);
    if (list.length === 0) {
      toast.error("Select at least one team using the checkboxes.");
      return;
    }
    setShowExportModal(true);
  };

  const confirmExportPdf = () => {
    const list = Object.values(selectedForExport);
    const sorted = prioritizeCompleteSubmissions
      ? sortTeamsCompleteFirst(list)
      : [...list].sort((a, b) => a.name.localeCompare(b.name));
    const stamp = new Date().toISOString().slice(0, 10);
    try {
      exportTeamsPdfByRegion(sorted, {
        filename: `teams-${stamp}.pdf`,
        generatedAt: new Date().toISOString(),
        excludeReviewers: exportExcludeReviewers,
      });
      toast.success(`Exported ${sorted.length} team(s) to PDF`);
      setShowExportModal(false);
    } catch (e) {
      console.error(e);
      toast.error("Could not generate PDF.");
    }
  };

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

  const completeCount = teams.filter(isAllRequiredDeliverablesComplete).length;

  const allOnPageSelected =
    displayTeams.length > 0 && displayTeams.every((t) => selectedForExport[t.id]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="relative max-w-md min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              placeholder="Search by team name or project (min. 2 characters)…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
              }}
            />
          </div>
          <label className="block min-w-[160px] text-xs font-medium text-slate-700">
            Region
            <select
              value={regionSelect}
              onChange={(e) => {
                setRegionSelect(e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              title="Filter by team lead region"
            >
              <option value="">All regions</option>
              {regionDropdownOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-[160px] text-xs font-medium text-slate-700">
            School
            <select
              value={schoolSelect}
              onChange={(e) => {
                setSchoolSelect(e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            >
              <option value="">All schools</option>
              {schoolDropdownOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-[200px] text-xs font-medium text-slate-700">
            Min. deliverables submitted
            <select
              value={minDeliverablesSubmitted}
              onChange={(e) => {
                setMinDeliverablesSubmitted(Number(e.target.value));
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              title="Required deliverables submitted (counts only non-optional templates)"
            >
              <option value={0}>Any</option>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>
                  At least {n}
                </option>
              ))}
            </select>
          </label>
          <label className="flex max-w-sm cursor-pointer items-start gap-2 text-xs font-medium leading-snug text-slate-700">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-slate-400"
              checked={prioritizeCompleteSubmissions}
              onChange={(e) => setPrioritizeCompleteSubmissions(e.target.checked)}
            />
            <span>
              Show teams that completed all required deliverables first (sorted in your browser only, no extra server
              work)
            </span>
          </label>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-1 sm:items-end">
          <button
            type="button"
            disabled={selectedExportCount === 0}
            onClick={openExportModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1f2937] disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" />
            Export PDF ({selectedExportCount})
          </button>
          {selectedExportCount > 0 && (
            <button
              type="button"
              onClick={() => setSelectedForExport({})}
              className="text-xs font-medium text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
            >
              Clear selection
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Use <strong className="font-medium text-slate-700">Assignments</strong> to assign reviewers. Tick teams to
        include in the PDF export (selection clears when you change filters). Optional “complete first” is client-side
        only. PDF is grouped by region with a table per region. Region is from the team lead when available.
      </p>

      {!loading && !error && (
        <div className="rounded-lg border border-emerald-200/90 bg-emerald-50/90 px-3 py-2">
          <p className="text-xs leading-relaxed text-emerald-950 sm:text-sm">
            <span className="tabular-nums font-semibold text-emerald-900">{teams.length}</span>{" "}
            {teams.length === 1 ? "team matches" : "teams match"}
            {completeCount > 0 ? (
              <>
                <span className="text-emerald-600"> · </span>
                <span className="tabular-nums font-semibold text-emerald-800">{completeCount}</span> with all{" "}
                {DELIVERABLES_COMPLETE_TARGET} required deliverables submitted
              </>
            ) : (
              <span className="text-emerald-800/85">
                {" "}
                — none have all {DELIVERABLES_COMPLETE_TARGET} yet.
              </span>
            )}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p>{error}</p>
          <button type="button" className="mt-2 text-sm font-medium text-red-900 underline" onClick={() => load()}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <JudgingTableSkeleton rows={6} cols={9} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-black text-xs font-semibold uppercase tracking-wide text-white">
              <tr>
                <th className="w-10 px-2 py-2.5">
                  <input
                    type="checkbox"
                    className="rounded border-slate-400"
                    checked={allOnPageSelected}
                    disabled={displayTeams.length === 0}
                    title="Select or clear all teams in the list for export"
                    onChange={() => {
                      if (allOnPageSelected) deselectAllOnPageForExport();
                      else selectAllOnPageForExport();
                    }}
                  />
                </th>
                <th className="px-3 py-2.5">Team</th>
                <th className="hidden px-3 py-2.5 sm:table-cell">Region</th>
                <th className="hidden px-3 py-2.5 md:table-cell">School</th>
                <th className="hidden px-3 py-2.5 lg:table-cell">Project</th>
                <th className="px-3 py-2.5">Members</th>
                <th className="px-3 py-2.5">Deliverables</th>
                <th className="px-3 py-2.5">Judges</th>
                <th className="px-3 py-2.5 text-right"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayTeams.length === 0 && !error ? (
                <tr>
                  <td colSpan={9} className="px-3 py-10 text-center text-slate-500">
                    No teams found.
                  </td>
                </tr>
              ) : (
                displayTeams.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        className="rounded border-slate-400"
                        checked={!!selectedForExport[t.id]}
                        title="Include in PDF export"
                        onChange={() => toggleExportSelect(t)}
                      />
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-900">{t.name}</td>
                    <td className="hidden max-w-[100px] truncate px-3 py-2 text-slate-600 sm:table-cell">
                      {t.region?.trim() ? t.region : "—"}
                    </td>
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

      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Export Options</h3>
            <p className="mt-1 text-xs text-slate-500">
              {Object.keys(selectedForExport).length} team(s) selected. Teams will be grouped by region and numbered.
            </p>
            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-slate-400"
                  checked={exportExcludeReviewers}
                  onChange={(e) => setExportExcludeReviewers(e.target.checked)}
                />
                <span>Exclude the <strong>Reviewers</strong> column from the PDF</span>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmExportPdf}
                className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937]"
              >
                <FileDown className="h-4 w-4" />
                Export PDF
              </button>
            </div>
          </div>
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
