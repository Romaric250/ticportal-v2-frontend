"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { adminService, type Team } from "../../src/lib/services/adminService";
import { gradingService } from "../../src/lib/services/gradingService";
import { exportAssignmentsPdf } from "../../src/utils/exportToPdf";
import { UserSearchPicker } from "./UserSearchPicker";
import { Modal } from "../ui/modal";
import { JudgingTableSkeleton } from "./grading-skeletons";

type AssignmentRow = {
  id: string;
  assignedAt: string;
  teamId: string;
  reviewerId: string;
  team: {
    name: string;
    projectTitle?: string | null;
    teamFinalGrade?: { id: string } | null;
  };
  reviewer: { firstName: string; lastName: string; email: string };
  assigner: { firstName: string; lastName: string };
  grade?: { status: string; submittedAt: string | null } | null;
};

function canUnassignAssignment(a: AssignmentRow): boolean {
  if (a.team?.teamFinalGrade?.id) return false;
  const g = a.grade;
  if (!g) return true;
  return g.status === "IN_PROGRESS" && g.submittedAt == null;
}

type StatusFilter = "all" | "draft" | "locked";
type GradeStatusFilter = "all" | "IN_PROGRESS" | "SUBMITTED" | "no_grade";
type TeamFinalizedFilter = "all" | "yes" | "no";
type TeamGroupSort =
  | "name_asc"
  | "name_desc"
  | "slots_desc"
  | "slots_asc"
  | "recent_activity";

function assignmentMatchesFilters(
  a: AssignmentRow,
  teamQ: string,
  reviewerQ: string,
  status: StatusFilter,
  gradeStatus: GradeStatusFilter,
  teamFinalized: TeamFinalizedFilter,
): boolean {
  const tq = teamQ.trim().toLowerCase();
  const rq = reviewerQ.trim().toLowerCase();
  if (tq) {
    const name = (a.team?.name ?? "").toLowerCase();
    const pt = (a.team?.projectTitle ?? "").toLowerCase();
    if (!name.includes(tq) && !pt.includes(tq)) return false;
  }
  if (rq) {
    const fn = (a.reviewer?.firstName ?? "").toLowerCase();
    const ln = (a.reviewer?.lastName ?? "").toLowerCase();
    const em = (a.reviewer?.email ?? "").toLowerCase();
    const full = `${fn} ${ln}`.trim();
    if (!fn.includes(rq) && !ln.includes(rq) && !em.includes(rq) && !full.includes(rq)) return false;
  }
  if (status === "draft" && !canUnassignAssignment(a)) return false;
  if (status === "locked" && canUnassignAssignment(a)) return false;

  if (gradeStatus === "IN_PROGRESS" && a.grade?.status !== "IN_PROGRESS") return false;
  if (gradeStatus === "SUBMITTED" && a.grade?.status !== "SUBMITTED") return false;
  if (gradeStatus === "no_grade" && a.grade != null) return false;

  if (teamFinalized === "yes" && !a.team?.teamFinalGrade?.id) return false;
  if (teamFinalized === "no" && a.team?.teamFinalGrade?.id) return false;

  return true;
}

export function TeamAssignment() {
  const [manualOpen, setManualOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [autoConfirmOpen, setAutoConfirmOpen] = useState(false);
  const [unassignAllOpen, setUnassignAllOpen] = useState(false);
  const [excludeReviewersSameRegionAsTeam, setExcludeReviewersSameRegionAsTeam] = useState(true);
  const [busy, setBusy] = useState(false);
  const [unassigningId, setUnassigningId] = useState<string | null>(null);
  const [unassignModal, setUnassignModal] = useState<AssignmentRow | null>(null);
  const [replacementId, setReplacementId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<AssignmentRow[] | null>(null);
  const [filterTeam, setFilterTeam] = useState("");
  const [filterReviewer, setFilterReviewer] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [gradeStatusFilter, setGradeStatusFilter] = useState<GradeStatusFilter>("all");
  const [teamFinalizedFilter, setTeamFinalizedFilter] = useState<TeamFinalizedFilter>("all");
  const [teamGroupSort, setTeamGroupSort] = useState<TeamGroupSort>("name_asc");

  const loadAssignments = useCallback(async () => {
    try {
      const data = await gradingService.listAssignments();
      setAssignments(Array.isArray(data) ? (data as AssignmentRow[]) : []);
    } catch {
      toast.error("Could not load assignments");
      setAssignments([]);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const runAuto = async () => {
    setBusy(true);
    try {
      const res = await gradingService.autoAssign({
        excludeReviewersSameRegionAsTeam,
      });
      const n = res.assigned ?? 0;
      const errList = res.errors ?? [];
      const skipped = res.skipped ?? [];

      if (n > 0) {
        toast.success(`Auto-assign completed: ${n} team(s) updated`);
      }
      if (errList.length > 0) {
        const preview = errList
          .slice(0, 3)
          .map((e) => (e.teamName ? `${e.teamName}: ${e.message}` : e.message))
          .join(" · ");
        toast.error(
          `${errList.length} team(s) could not be assigned${preview ? ` — ${preview}` : ""}${errList.length > 3 ? " …" : ""}`
        );
      }
      if (skipped.length > 0) {
        toast.warning(
          `${skipped.length} team(s) skipped (not enough reviewers under your cap or eligible pool). Check Leaderboard assignment limits.`
        );
      }
      const warnList = res.warnings ?? [];
      if (warnList.length > 0) {
        const preview = warnList
          .slice(0, 5)
          .map((w) => w.message)
          .join(" · ");
        toast.warning(
          `Same-region notice: ${warnList.length} assignment(s) have a reviewer from the same region — ${preview}${warnList.length > 5 ? " …" : ""}`,
          { duration: 10000 }
        );
      }
      if (n === 0 && errList.length === 0 && skipped.length === 0) {
        toast.message("Nothing to assign — every team already has three reviewers, or there are no teams.");
      }

      setAutoConfirmOpen(false);
      loadAssignments();
    } catch (e: unknown) {
      const ax = e && typeof e === "object" && "message" in e ? String((e as Error).message) : "";
      const fromBody =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(fromBody || ax || "Auto-assign failed");
    } finally {
      setBusy(false);
    }
  };

  const closeUnassignModal = () => {
    setUnassignModal(null);
    setReplacementId(null);
  };

  const confirmUnassign = async () => {
    if (!unassignModal) return;
    if (replacementId) {
      if (replacementId === unassignModal.reviewerId) {
        toast.error("Choose someone other than the reviewer you are removing");
        return;
      }
      if (otherRows.some((x) => x.reviewerId === replacementId)) {
        toast.error("That reviewer is already assigned to this team");
        return;
      }
    }
    setUnassigningId(unassignModal.id);
    try {
      await gradingService.unassignReviewer(unassignModal.teamId, unassignModal.reviewerId, {
        replacementReviewerId: replacementId ?? undefined,
      });
      toast.success(replacementId ? "Reviewer replaced" : "Reviewer unassigned");
      closeUnassignModal();
      await loadAssignments();
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "response" in e ? (e as any).response?.data?.message : null;
      toast.error(msg || "Request failed");
    } finally {
      setUnassigningId(null);
    }
  };

  const otherRows =
    unassignModal && assignments
      ? assignments.filter(
          (x) => x.teamId === unassignModal.teamId && x.reviewerId !== unassignModal.reviewerId
        )
      : [];

  const draftUnassignCount = useMemo(
    () => (assignments ? assignments.filter(canUnassignAssignment).length : 0),
    [assignments]
  );

  const assignmentsByTeam = useMemo(() => {
    if (!assignments) return [];
    const filtered = assignments.filter((a) =>
      assignmentMatchesFilters(
        a,
        filterTeam,
        filterReviewer,
        statusFilter,
        gradeStatusFilter,
        teamFinalizedFilter,
      ),
    );
    const byTeam = new Map<string, AssignmentRow[]>();
    for (const a of filtered) {
      const arr = byTeam.get(a.teamId) ?? [];
      arr.push(a);
      byTeam.set(a.teamId, arr);
    }
    for (const arr of byTeam.values()) {
      arr.sort((x, y) => new Date(y.assignedAt).getTime() - new Date(x.assignedAt).getTime());
    }
    const groups = [...byTeam.entries()].map(([teamId, rows]) => ({
      teamId,
      team: rows[0]!.team,
      rows,
    }));

    const maxAssigned = (g: (typeof groups)[0]) =>
      Math.max(...g.rows.map((r) => new Date(r.assignedAt).getTime()), 0);

    groups.sort((x, y) => {
      switch (teamGroupSort) {
        case "name_desc":
          return (y.team?.name ?? "").localeCompare(x.team?.name ?? "", undefined, { sensitivity: "base" });
        case "slots_desc":
          return y.rows.length - x.rows.length;
        case "slots_asc":
          return x.rows.length - y.rows.length;
        case "recent_activity":
          return maxAssigned(y) - maxAssigned(x);
        case "name_asc":
        default:
          return (x.team?.name ?? "").localeCompare(y.team?.name ?? "", undefined, { sensitivity: "base" });
      }
    });
    return groups;
  }, [
    assignments,
    filterTeam,
    filterReviewer,
    statusFilter,
    gradeStatusFilter,
    teamFinalizedFilter,
    teamGroupSort,
  ]);

  const filteredAssignmentCount = useMemo(
    () => assignmentsByTeam.reduce((n, g) => n + g.rows.length, 0),
    [assignmentsByTeam],
  );

  const hasActiveFilters =
    filterTeam.trim() !== "" ||
    filterReviewer.trim() !== "" ||
    statusFilter !== "all" ||
    gradeStatusFilter !== "all" ||
    teamFinalizedFilter !== "all" ||
    teamGroupSort !== "name_asc";

  const handleExportPdf = useCallback(() => {
    if (!assignmentsByTeam.length) {
      toast.error("Nothing to export — adjust filters or load assignments.");
      return;
    }
    const groups = assignmentsByTeam.map((g) => ({
      teamName: g.team?.name ?? "—",
      projectTitle: g.team?.projectTitle,
      finalized: !!g.team?.teamFinalGrade?.id,
      rows: g.rows.map((a) => {
        const reviewer = `${a.reviewer?.firstName ?? ""} ${a.reviewer?.lastName ?? ""}`.trim() || "—";
        const assigner = `${a.assigner?.firstName ?? ""} ${a.assigner?.lastName ?? ""}`.trim() || "—";
        let grade = "—";
        if (a.grade) {
          if (a.grade.status === "SUBMITTED") grade = "Submitted";
          else if (a.grade.status === "IN_PROGRESS") grade = "In progress";
          else grade = a.grade.status;
        }
        return {
          reviewer,
          email: a.reviewer?.email ?? "—",
          assigner,
          assignedAt: new Date(a.assignedAt).toLocaleString(),
          grade,
          slot: canUnassignAssignment(a) ? "Draft" : "Locked",
        };
      }),
    }));
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    exportAssignmentsPdf(groups, { filename: `assignments-${stamp}.pdf` });
    toast.success("PDF downloaded");
  }, [assignmentsByTeam]);

  const runUnassignAll = async () => {
    setBusy(true);
    try {
      const res = await gradingService.unassignAllEligible();
      const { removed, attempted, ineligibleCount, failed } = res;
      if (removed > 0) {
        toast.success(`Unassigned ${removed} draft assignment${removed === 1 ? "" : "s"}.`);
      }
      if (ineligibleCount > 0) {
        toast.message(
          `${ineligibleCount} assignment${ineligibleCount === 1 ? "" : "s"} skipped (finalized team or submitted review).`,
          { duration: 8000 }
        );
      }
      if (failed.length > 0) {
        const preview = failed
          .slice(0, 3)
          .map((f) => f.message)
          .join(" · ");
        toast.error(
          `${failed.length} could not be removed${preview ? ` — ${preview}` : ""}${failed.length > 3 ? " …" : ""}`
        );
      }
      if (removed === 0 && failed.length === 0 && (assignments?.length ?? 0) === 0) {
        toast.message("No assignments to clear.");
      }
      setUnassignAllOpen(false);
      await loadAssignments();
    } catch (e: unknown) {
      const fromBody =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(fromBody || "Bulk unassign failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Assignments</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Auto-assign three reviewers per team, manual assign, bulk assign, or unassign draft slots. Per-reviewer caps live under{" "}
            <strong className="text-slate-700">Judging → Leaderboard</strong> (assignment limits).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => setAutoConfirmOpen(true)}
            className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-50"
          >
            Run auto-assign
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setManualOpen(true)}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
          >
            Manual assign
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setBulkOpen(true)}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
          >
            Bulk assign (same 3)
          </button>
          <button
            type="button"
            disabled={busy || assignments === null || draftUnassignCount === 0}
            onClick={() => setUnassignAllOpen(true)}
            title={
              draftUnassignCount === 0
                ? "No draft assignments to remove"
                : `Remove ${draftUnassignCount} draft assignment(s)`
            }
            className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-50 disabled:opacity-50"
          >
            Unassign all (drafts)
          </button>
          <button
            type="button"
            disabled={busy || assignments === null || filteredAssignmentCount === 0}
            onClick={handleExportPdf}
            title="Download current table (respects filters) as PDF"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
          >
            <FileDown className="h-3.5 w-3.5 shrink-0" />
            Export PDF
          </button>
        </div>
      </div>

      {assignments === null ? (
        <JudgingTableSkeleton rows={5} cols={5} />
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Filters & order</h3>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setFilterTeam("");
                    setFilterReviewer("");
                    setStatusFilter("all");
                    setGradeStatusFilter("all");
                    setTeamFinalizedFilter("all");
                    setTeamGroupSort("name_asc");
                  }}
                  className="text-xs font-medium text-sky-800 underline hover:text-sky-950"
                >
                  Reset all
                </button>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Team / project</label>
                <input
                  type="search"
                  value={filterTeam}
                  onChange={(e) => setFilterTeam(e.target.value)}
                  placeholder="Search…"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Reviewer</label>
                <input
                  type="search"
                  value={filterReviewer}
                  onChange={(e) => setFilterReviewer(e.target.value)}
                  placeholder="Name or email…"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Unassign slot</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="all">All rows</option>
                  <option value="draft">Draft (can unassign)</option>
                  <option value="locked">Locked</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Grade status</label>
                <select
                  value={gradeStatusFilter}
                  onChange={(e) => setGradeStatusFilter(e.target.value as GradeStatusFilter)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="all">Any</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="no_grade">No grade row</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Team finalized</label>
                <select
                  value={teamFinalizedFilter}
                  onChange={(e) => setTeamFinalizedFilter(e.target.value as TeamFinalizedFilter)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="all">Any</option>
                  <option value="yes">Finalized</option>
                  <option value="no">Not finalized</option>
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">Order teams by</label>
                <select
                  value={teamGroupSort}
                  onChange={(e) => setTeamGroupSort(e.target.value as TeamGroupSort)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="name_asc">Team name A→Z</option>
                  <option value="name_desc">Team name Z→A</option>
                  <option value="slots_desc">Most reviewers first</option>
                  <option value="slots_asc">Fewest reviewers first</option>
                  <option value="recent_activity">Latest assignment activity</option>
                </select>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            {assignments.length === 0 ? (
              <>No assignments yet.</>
            ) : (
              <>
                <span className="font-medium text-slate-700">{assignmentsByTeam.length}</span> team
                {assignmentsByTeam.length === 1 ? "" : "s"} ·{" "}
                <span className="font-medium text-slate-700">{filteredAssignmentCount}</span> assignment row
                {filteredAssignmentCount === 1 ? "" : "s"}
                {hasActiveFilters && assignments.length !== filteredAssignmentCount ? (
                  <span className="text-slate-400"> (of {assignments.length} total)</span>
                ) : null}
              </>
            )}
          </p>

          {assignments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500">
              No assignments yet — use auto-assign or manual assign above.
            </div>
          ) : assignmentsByTeam.length === 0 ? (
            <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50/50 px-4 py-8 text-center text-sm text-amber-900">
              No rows match your filters. Try clearing search or setting &quot;All assignments&quot;.
            </div>
          ) : (
            <div className="space-y-3">
              {assignmentsByTeam.map((group) => (
                <details
                  key={group.teamId}
                  open
                  className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 bg-slate-900 px-3 py-2.5 text-left text-white marker:content-none [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold">{group.team?.name ?? "—"}</span>
                      {group.team?.projectTitle ? (
                        <span className="mt-0.5 block truncate text-xs font-normal text-slate-300">
                          {group.team.projectTitle}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {group.team?.teamFinalGrade?.id ? (
                        <span className="rounded bg-emerald-600/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                          Finalized
                        </span>
                      ) : (
                        <span className="rounded bg-slate-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-200">
                          Not finalized
                        </span>
                      )}
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-200">
                        {group.rows.length} reviewer{group.rows.length === 1 ? "" : "s"}
                      </span>
                      <span className="text-slate-400 transition group-open:rotate-180">▼</span>
                    </div>
                  </summary>
                  <div className="overflow-x-auto border-t border-slate-100">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                        <tr>
                          <th className="px-3 py-2">Reviewer</th>
                          <th className="px-3 py-2">Assigned by</th>
                          <th className="px-3 py-2">When</th>
                          <th className="px-3 py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {group.rows.map((a) => (
                          <tr key={a.id} className="hover:bg-slate-50/80">
                            <td className="px-3 py-2 text-slate-700">
                              {a.reviewer?.firstName} {a.reviewer?.lastName}
                              <span className="block text-xs text-slate-400">{a.reviewer?.email}</span>
                              {a.grade && a.grade.status !== "IN_PROGRESS" ? (
                                <span className="mt-0.5 block text-xs text-amber-700">Status: {a.grade.status}</span>
                              ) : null}
                            </td>
                            <td className="px-3 py-2 text-slate-600">
                              {a.assigner?.firstName} {a.assigner?.lastName}
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">
                              {a.assignedAt ? new Date(a.assignedAt).toLocaleString() : "—"}
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 text-right">
                              {canUnassignAssignment(a) ? (
                                <button
                                  type="button"
                                  disabled={unassigningId === a.id || busy}
                                  onClick={() => {
                                    setUnassignModal(a);
                                    setReplacementId(null);
                                  }}
                                  className="text-xs font-medium text-red-700 hover:text-red-900 disabled:opacity-40"
                                >
                                  {unassigningId === a.id ? "…" : "Unassign"}
                                </button>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        variant="light"
        open={autoConfirmOpen}
        onClose={() => !busy && setAutoConfirmOpen(false)}
        title="Confirm auto-assign"
        className="max-w-md"
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm text-slate-600">
            This will assign <strong className="text-slate-900">three reviewers per team</strong> that do not yet have a
            full panel, using a fair workload split. Reviewers who are on a team will not be assigned to that team.
          </p>
          <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="mt-1 rounded border-slate-400"
              checked={excludeReviewersSameRegionAsTeam}
              onChange={(e) => setExcludeReviewersSameRegionAsTeam(e.target.checked)}
            />
            <span>
              Prefer reviewers from a different region than the team lead (when possible). Same-region assignments still
              go through if needed, with a warning.
            </span>
          </label>
          <ul className="list-inside list-disc space-y-1 text-xs text-slate-500">
            <li>Teams that already have three assignments are skipped.</li>
            <li>If a max teams per reviewer is set (Leaderboard tab), reviewers at that cap are skipped until unassigned.</li>
            <li>Reviewers may receive email notifications if enabled on the server.</li>
          </ul>
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={busy}
              onClick={() => setAutoConfirmOpen(false)}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void runAuto()}
              className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-50"
            >
              {busy ? "Running…" : "Confirm & run"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        variant="light"
        open={unassignAllOpen}
        onClose={() => !busy && setUnassignAllOpen(false)}
        title="Unassign all draft assignments?"
        className="max-w-md"
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm text-slate-600">
            This removes <strong className="text-slate-900">every reviewer assignment</strong> that is still a draft: no
            submitted review, and the team is not finalized. Same rules as the red <strong>Unassign</strong> button on
            each row.
          </p>
          <p className="text-sm text-slate-600">
            Assignments tied to a <strong>submitted or finalized</strong> review are left in place.
          </p>
          {assignments && draftUnassignCount > 0 ? (
            <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-800">
              About to remove up to <strong>{draftUnassignCount}</strong> row{draftUnassignCount === 1 ? "" : "s"} (
              {assignments.length} total in the table).
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={busy}
              onClick={() => setUnassignAllOpen(false)}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy || draftUnassignCount === 0}
              onClick={() => void runUnassignAll()}
              className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
            >
              {busy ? "Working…" : "Unassign all drafts"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        variant="light"
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        title="Manual assign reviewers"
        className="max-w-2xl"
      >
        <ManualAssignForm
          onSuccess={() => {
            setManualOpen(false);
            loadAssignments();
          }}
        />
      </Modal>

      <Modal
        variant="light"
        open={bulkOpen}
        onClose={() => !busy && setBulkOpen(false)}
        title="Bulk assign the same three reviewers"
        className="max-w-3xl"
      >
        <BulkAssignSameReviewersForm
          open={bulkOpen}
          onSuccess={() => {
            setBulkOpen(false);
            loadAssignments();
          }}
        />
      </Modal>

      <Modal
        variant="light"
        open={unassignModal != null}
        onClose={() => !unassigningId && closeUnassignModal()}
        title="Remove or replace reviewer?"
        className="max-w-lg"
      >
        {unassignModal ? (
          <div className="space-y-4 pt-1">
            <p className="text-sm text-slate-600">
              This removes the draft assignment for{" "}
              <strong className="text-slate-900">
                {unassignModal.reviewer.firstName} {unassignModal.reviewer.lastName}
              </strong>{" "}
              on <strong className="text-slate-900">{unassignModal.team.name}</strong>. Their unsaved draft is deleted.
            </p>
            <p className="text-sm text-slate-600">
              The <strong className="text-slate-900">other reviewers’ scores</strong> are not changed — only assignment
              metadata is updated when you replace someone.
            </p>
            {otherRows.length > 0 ? (
              <>
                <p className="text-xs text-slate-500">
                  Other reviewer{otherRows.length !== 1 ? "s" : ""} on this team:{" "}
                  {otherRows.map((p) => `${p.reviewer.firstName} ${p.reviewer.lastName}`).join(" · ")}.
                </p>
                <UserSearchPicker
                  label="Replace with another reviewer (optional)"
                  value={replacementId}
                  onChange={(id) => setReplacementId(id)}
                  disabled={!!unassigningId}
                />
                <p className="text-xs text-slate-500">
                  If you pick someone, they fill the slot you are freeing. Leave empty to only remove this reviewer.
                </p>
              </>
            ) : (
              <p className="text-xs text-amber-800">
                This team has no other assignment row yet — you can only remove this reviewer; add reviewers afterward
                with Manual or bulk assign.
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={!!unassigningId}
                onClick={closeUnassignModal}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!!unassigningId}
                onClick={() => void confirmUnassign()}
                className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-50"
              >
                {unassigningId ? "…" : "Confirm"}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function BulkAssignSameReviewersForm({ open, onSuccess }: { open: boolean; onSuccess: () => void }) {
  const [searchFilter, setSearchFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [minDeliverables, setMinDeliverables] = useState(0);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<string[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [r1, setR1] = useState<string | null>(null);
  const [r2, setR2] = useState<string | null>(null);
  const [r3, setR3] = useState<string | null>(null);
  const [rejectReviewersFromTeamRegion, setRejectReviewersFromTeamRegion] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setSearchFilter("");
    setRegionFilter("");
    setSchoolFilter("");
    setMinDeliverables(0);
    setLoadingTeams(true);
    void (async () => {
      try {
        const res = await adminService.getTeams(1, 80, { includeDeliverableStats: true });
        if (cancelled) return;
        const list = res.teams ?? [];
        setAllTeams(list);
        setSelected({});
        const [schools, regionStats] = await Promise.all([
          adminService.getDistinctTeamSchools(),
          adminService.getUsersByRegionStats(),
        ]);
        if (cancelled) return;
        setSchoolOptions(schools);
        const fromStats = regionStats.map((x) => x.region?.trim()).filter((x): x is string => Boolean(x));
        const fromTeams = list.map((t) => t.region?.trim()).filter((x): x is string => Boolean(x));
        setRegionOptions([...new Set([...fromStats, ...fromTeams])].sort((a, b) => a.localeCompare(b)));
      } catch {
        if (!cancelled) {
          toast.error("Could not load teams");
          setAllTeams([]);
        }
      } finally {
        if (!cancelled) setLoadingTeams(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const filteredTeams = useMemo(() => {
    let list = allTeams;
    const term = searchFilter.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          (t.projectTitle?.toLowerCase().includes(term) ?? false)
      );
    }
    if (regionFilter.trim()) {
      const r = regionFilter.trim().toLowerCase();
      list = list.filter((t) => (t.region?.trim().toLowerCase() ?? "") === r);
    }
    if (schoolFilter.trim()) {
      const s = schoolFilter.trim().toLowerCase();
      list = list.filter((t) => (t.school?.trim().toLowerCase() ?? "") === s);
    }
    if (minDeliverables >= 1) {
      list = list.filter((t) => (t.deliverableSubmitted ?? 0) >= minDeliverables);
    }
    return list;
  }, [allTeams, searchFilter, regionFilter, schoolFilter, minDeliverables]);

  const eligibleTeams = useMemo(
    () => filteredTeams.filter((t) => (t.reviewerAssignmentCount ?? 0) < 3),
    [filteredTeams]
  );

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const selectedIds = Object.keys(selected).filter((k) => selected[k]);

  const submit = async () => {
    if (selectedIds.length === 0 || !r1 || !r2 || !r3) {
      toast.error("Select at least one team and three reviewers");
      return;
    }
    if (new Set([r1, r2, r3]).size !== 3) {
      toast.error("Choose three different reviewers");
      return;
    }
    setSubmitting(true);
    try {
      const res = await gradingService.bulkAssignSameReviewers({
        teamIds: selectedIds,
        reviewerIds: [r1, r2, r3],
        rejectReviewersFromTeamRegion,
        sendMail: true,
      });
      const n = res.assigned ?? 0;
      const errs = res.errors ?? [];
      const warns = res.warnings ?? [];
      if (n > 0) toast.success(`Assigned ${n} team(s)`);
      if (warns.length > 0) {
        const preview = warns.slice(0, 5).map((w) => w.message).join(" · ");
        toast.warning(
          `Same-region notice: ${warns.length} assignment(s) have a reviewer from the same region — ${preview}${warns.length > 5 ? " …" : ""}`,
          { duration: 10000 }
        );
      }
      if (errs.length) errs.slice(0, 5).forEach((e) => toast.error(`${e.teamId}: ${e.message}`));
      if (errs.length > 5) toast.message(`…and ${errs.length - 5} more`);
      onSuccess();
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "response" in e ? (e as { response?: { data?: { message?: string } } }).response?.data?.message : null;
      toast.error(msg || "Bulk assign failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pt-1">
      <p className="text-xs text-slate-600">
        Only teams with <strong>fewer than three</strong> assigned reviewers are listed, with a{" "}
        <strong>reviewer count</strong> per row. Use the dropdowns to narrow by <strong>team lead region</strong> and{" "}
        <strong>school</strong>, tick teams, then pick the same three reviewers. Use “reject same-region” to block
        reviewers whose region matches a team’s lead region.
      </p>
      <div>
        <label className="block text-xs font-medium text-slate-700">
          Search teams
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            disabled={loadingTeams}
            placeholder="Filter by team name or project title…"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="block min-w-[180px] flex-1 text-xs font-medium text-slate-700">
          Team lead region
          <select
            value={regionFilter}
            onChange={(e) => {
              setRegionFilter(e.target.value);
              setSelected({});
            }}
            disabled={loadingTeams}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="">All regions</option>
            {regionOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-[180px] flex-1 text-xs font-medium text-slate-700">
          School
          <select
            value={schoolFilter}
            onChange={(e) => {
              setSchoolFilter(e.target.value);
              setSelected({});
            }}
            disabled={loadingTeams}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="">All schools</option>
            {schoolOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-[140px] text-xs font-medium text-slate-700">
          Min deliverables submitted
          <select
            value={minDeliverables}
            onChange={(e) => {
              setMinDeliverables(Number(e.target.value));
              setSelected({});
            }}
            disabled={loadingTeams}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            {Array.from({ length: 8 }, (_, i) => (
              <option key={i} value={i}>
                {i === 0 ? "Any" : `≥ ${i}`}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loadingTeams && <p className="text-xs text-slate-500">Loading teams…</p>}

      {!loadingTeams && allTeams.length === 0 && (
        <p className="text-sm text-amber-800">No teams returned. Check the API or try again.</p>
      )}
      {!loadingTeams && allTeams.length > 0 && filteredTeams.length === 0 && (
        <p className="text-sm text-slate-600">No teams match the selected region and school. Clear filters to see all.</p>
      )}
      {!loadingTeams && filteredTeams.length > 0 && eligibleTeams.length === 0 && (
        <p className="text-sm text-slate-600">
          Every team matching your filters already has three reviewers. Adjust filters or assign manually elsewhere.
        </p>
      )}
      {!loadingTeams && eligibleTeams.length > 0 && (
        <div className="max-h-48 overflow-y-auto rounded border border-slate-200 px-2 py-2 text-sm">
          <p className="mb-2 text-xs font-medium text-slate-600">
            Select teams ({selectedIds.length} selected, {eligibleTeams.length} need reviewers)
          </p>
          <ul className="space-y-1">
            {eligibleTeams.map((t) => (
              <li key={t.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!selected[t.id]}
                  onChange={() => toggle(t.id)}
                  className="rounded border-slate-400"
                />
                <span className="text-slate-800">
                  {t.name}
                  <span className="text-xs font-medium text-slate-600">
                    {" "}
                    · {t.reviewerAssignmentCount ?? 0}/3 reviewers
                  </span>
                  {t.region ? <span className="text-xs text-slate-500"> · {t.region}</span> : null}
                  {typeof t.deliverableSubmitted === "number" ? (
                    <span className="text-xs text-slate-400"> · {t.deliverableSubmitted}/{t.deliverableTotal ?? "?"} submitted</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <UserSearchPicker label="Reviewer 1" value={r1} onChange={(id) => setR1(id)} disabled={submitting} />
      <UserSearchPicker label="Reviewer 2" value={r2} onChange={(id) => setR2(id)} disabled={submitting} />
      <UserSearchPicker label="Reviewer 3" value={r3} onChange={(id) => setR3(id)} disabled={submitting} />

      <p className="text-xs text-slate-500">
        If a reviewer is from the same region as a team, the assignment still goes through but you will see a warning.
        Assignment emails are sent to reviewers when you save (server mail settings apply).
      </p>


      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          disabled={submitting}
          onClick={submit}
          className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-50"
        >
          {submitting ? "Assigning…" : "Assign to selected teams"}
        </button>
      </div>
    </div>
  );
}

function ManualAssignForm({ onSuccess }: { onSuccess: () => void }) {
  const [teamId, setTeamId] = useState<string | null>(null);
  const [r1, setR1] = useState<string | null>(null);
  const [r2, setR2] = useState<string | null>(null);
  const [r3, setR3] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [teamPairHint, setTeamPairHint] = useState<string | null>(null);
  const [loadingTeamReviewers, setLoadingTeamReviewers] = useState(false);

  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<string[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [minDeliverables, setMinDeliverables] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoadingTeams(true);
    void (async () => {
      try {
        const res = await adminService.getTeams(1, 80, { includeDeliverableStats: true });
        if (cancelled) return;
        const list = res.teams ?? [];
        setAllTeams(list);
        const [schools, regionStats] = await Promise.all([
          adminService.getDistinctTeamSchools(),
          adminService.getUsersByRegionStats(),
        ]);
        if (cancelled) return;
        setSchoolOptions(schools);
        const fromStats = regionStats.map((x) => x.region?.trim()).filter((x): x is string => Boolean(x));
        const fromTeams = list.map((t) => t.region?.trim()).filter((x): x is string => Boolean(x));
        setRegionOptions([...new Set([...fromStats, ...fromTeams])].sort((a, b) => a.localeCompare(b)));
      } catch {
        if (!cancelled) setAllTeams([]);
      } finally {
        if (!cancelled) setLoadingTeams(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredTeams = useMemo(() => {
    let list = allTeams;
    const term = searchFilter.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          (t.projectTitle?.toLowerCase().includes(term) ?? false)
      );
    }
    if (regionFilter.trim()) {
      const r = regionFilter.trim().toLowerCase();
      list = list.filter((t) => (t.region?.trim().toLowerCase() ?? "") === r);
    }
    if (schoolFilter.trim()) {
      const s = schoolFilter.trim().toLowerCase();
      list = list.filter((t) => (t.school?.trim().toLowerCase() ?? "") === s);
    }
    if (minDeliverables >= 1) {
      list = list.filter((t) => (t.deliverableSubmitted ?? 0) >= minDeliverables);
    }
    return list;
  }, [allTeams, searchFilter, regionFilter, schoolFilter, minDeliverables]);

  const teamsEligible = useMemo(
    () => filteredTeams.filter((t) => (t.reviewerAssignmentCount ?? 0) < 3),
    [filteredTeams]
  );

  useEffect(() => {
    if (teamId && !teamsEligible.some((t) => t.id === teamId)) {
      setTeamId(null);
    }
  }, [teamId, teamsEligible]);

  useEffect(() => {
    if (!teamId) {
      setR1(null);
      setR2(null);
      setR3(null);
      setTeamPairHint(null);
      return;
    }
    let cancelled = false;
    setLoadingTeamReviewers(true);
    setTeamPairHint(null);
    void (async () => {
      try {
        const rows = await gradingService.assignmentsForTeam(teamId);
        if (cancelled) return;
        const sorted = [...rows].sort((a, b) => a.reviewerId.localeCompare(b.reviewerId));
        if (sorted.length === 0) {
          setR1(null);
          setR2(null);
          setR3(null);
          setTeamPairHint("No reviewers on this team yet — choose three reviewers below.");
        } else if (sorted.length === 1) {
          setR1(sorted[0].reviewerId);
          setR2(null);
          setR3(null);
          setTeamPairHint(
            `One reviewer already assigned (${sorted[0].firstName} ${sorted[0].lastName}). Add the remaining two.`
          );
        } else if (sorted.length === 2) {
          setR1(sorted[0].reviewerId);
          setR2(sorted[1].reviewerId);
          setR3(null);
          setTeamPairHint("Two reviewers assigned — pick the third, or change all three slots.");
        } else {
          const top = sorted.slice(0, 3);
          setR1(top[0].reviewerId);
          setR2(top[1].reviewerId);
          setR3(top[2].reviewerId);
          setTeamPairHint("This team already has three reviewers — saving replaces the panel (draft-only slots can be swapped).");
        }
      } catch {
        if (!cancelled) {
          setR1(null);
          setR2(null);
          setR3(null);
          setTeamPairHint("Could not load current reviewers for this team.");
        }
      } finally {
        if (!cancelled) setLoadingTeamReviewers(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  const submit = async () => {
    if (!teamId || !r1 || !r2 || !r3) {
      toast.error("Select a team and three reviewers");
      return;
    }
    if (new Set([r1, r2, r3]).size !== 3) {
      toast.error("Choose three different reviewers");
      return;
    }
    setSubmitting(true);
    try {
      const res = await gradingService.manualAssign([{ teamId, reviewerIds: [r1, r2, r3] }]);
      toast.success("Assignments saved");
      const warns = res.warnings ?? [];
      if (warns.length > 0) {
        toast.warning(
          `Same-region notice: ${warns.map((w) => w.message).join(" · ")}`,
          { duration: 10000 }
        );
      }
      onSuccess();
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "response" in e ? (e as { response?: { data?: { message?: string } } }).response?.data?.message : null;
      toast.error(msg || "Manual assign failed");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTeam = allTeams.find((t) => t.id === teamId);

  return (
    <div className="space-y-5 pt-1">
      <p className="text-xs text-slate-500">
        Only teams with <strong className="text-slate-700">fewer than three</strong> assigned reviewers appear below
        (each row shows <strong className="text-slate-700">N/3 reviewers</strong>). Choose the final three reviewers for
        this team. Partial assignments are pre-filled so you can add the rest. Reviewers not in your list are removed
        only if they have not submitted; team members cannot review their own team.
      </p>

      <div>
        <label className="block text-xs font-medium text-slate-700">
          Search teams
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            disabled={loadingTeams || submitting}
            placeholder="Filter by team name or project title…"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="block min-w-[160px] flex-1 text-xs font-medium text-slate-700">
          Team lead region
          <select
            value={regionFilter}
            onChange={(e) => { setRegionFilter(e.target.value); setTeamId(null); }}
            disabled={loadingTeams || submitting}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="">All regions</option>
            {regionOptions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="block min-w-[160px] flex-1 text-xs font-medium text-slate-700">
          School
          <select
            value={schoolFilter}
            onChange={(e) => { setSchoolFilter(e.target.value); setTeamId(null); }}
            disabled={loadingTeams || submitting}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="">All schools</option>
            {schoolOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="block min-w-[130px] text-xs font-medium text-slate-700">
          Min deliverables
          <select
            value={minDeliverables}
            onChange={(e) => { setMinDeliverables(Number(e.target.value)); setTeamId(null); }}
            disabled={loadingTeams || submitting}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            {Array.from({ length: 8 }, (_, i) => (
              <option key={i} value={i}>{i === 0 ? "Any" : `≥ ${i}`}</option>
            ))}
          </select>
        </label>
      </div>

      {loadingTeams && <p className="text-xs text-slate-500">Loading teams…</p>}

      {!loadingTeams && (
        <div>
          <label className="text-xs font-medium text-slate-600">
            Select team
            {teamsEligible.length > 0 ? ` (${teamsEligible.length} need reviewers)` : ""}
          </label>
          <div className="mt-1 max-h-40 overflow-y-auto rounded border border-slate-200 px-2 py-2 text-sm">
            {filteredTeams.length === 0 ? (
              <p className="px-1 py-2 text-xs text-slate-500">No teams match the current filters.</p>
            ) : teamsEligible.length === 0 ? (
              <p className="px-1 py-2 text-xs text-slate-500">
                All teams matching your filters already have three reviewers. Adjust filters or use another tab.
              </p>
            ) : (
              <ul className="space-y-0.5">
                {teamsEligible.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setTeamId(t.id)}
                      className={`w-full rounded px-2 py-1.5 text-left text-sm hover:bg-slate-50 ${
                        teamId === t.id ? "bg-slate-100 font-medium" : ""
                      }`}
                    >
                      <span className="text-slate-900">{t.name}</span>
                      <span className="text-xs font-medium text-slate-600">
                        {" "}
                        · {t.reviewerAssignmentCount ?? 0}/3 reviewers
                      </span>
                      {t.region ? <span className="text-xs text-slate-500"> · {t.region}</span> : null}
                      {typeof t.deliverableSubmitted === "number" ? (
                        <span className="text-xs text-slate-400"> · {t.deliverableSubmitted}/{t.deliverableTotal ?? "?"} submitted</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {teamId && selectedTeam && (
        <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          Selected: <strong className="text-slate-900">{selectedTeam.name}</strong>
          {selectedTeam.projectTitle ? ` — ${selectedTeam.projectTitle}` : ""}
        </p>
      )}

      {teamId && loadingTeamReviewers && (
        <p className="text-xs text-slate-500">Loading current reviewers…</p>
      )}
      {teamPairHint && !loadingTeamReviewers && (
        <p className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900">{teamPairHint}</p>
      )}
      <UserSearchPicker label="Reviewer 1" value={r1} onChange={(id) => setR1(id)} disabled={submitting} />
      <UserSearchPicker label="Reviewer 2" value={r2} onChange={(id) => setR2(id)} disabled={submitting} />
      <UserSearchPicker label="Reviewer 3" value={r3} onChange={(id) => setR3(id)} disabled={submitting} />
      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          disabled={submitting}
          onClick={submit}
          className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Assign panel"}
        </button>
      </div>
    </div>
  );
}
