"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { adminService, type Team } from "../../src/lib/services/adminService";
import { gradingService } from "../../src/lib/services/gradingService";
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

export function TeamAssignment() {
  const [manualOpen, setManualOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [autoConfirmOpen, setAutoConfirmOpen] = useState(false);
  const [excludeReviewersSameRegionAsTeam, setExcludeReviewersSameRegionAsTeam] = useState(true);
  const [busy, setBusy] = useState(false);
  const [unassigningId, setUnassigningId] = useState<string | null>(null);
  const [unassignModal, setUnassignModal] = useState<AssignmentRow | null>(null);
  const [replacementId, setReplacementId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<AssignmentRow[] | null>(null);

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
        </div>
      </div>

      {assignments === null ? (
        <JudgingTableSkeleton rows={5} cols={5} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-black text-xs font-semibold uppercase tracking-wide text-white">
              <tr>
                <th className="px-3 py-2.5">Team</th>
                <th className="px-3 py-2.5">Reviewer</th>
                <th className="px-3 py-2.5">Assigned by</th>
                <th className="px-3 py-2.5">When</th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                    No assignments yet.
                  </td>
                </tr>
              ) : (
                assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-900">
                      {a.team?.name ?? "—"}
                      {a.team?.projectTitle ? (
                        <span className="block text-xs text-slate-500">{a.team.projectTitle}</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
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
                ))
              )}
            </tbody>
          </table>
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

  const teams = useMemo(() => {
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
        All teams load when you open this dialog. Use the dropdowns to narrow by <strong>team lead region</strong> and{" "}
        <strong>school</strong>, tick the teams to include, then pick the same three reviewers. Use “reject same-region”
        to block reviewers whose region matches a team’s lead region.
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
      {!loadingTeams && allTeams.length > 0 && teams.length === 0 && (
        <p className="text-sm text-slate-600">No teams match the selected region and school. Clear filters to see all.</p>
      )}
      {!loadingTeams && teams.length > 0 && (
        <div className="max-h-48 overflow-y-auto rounded border border-slate-200 px-2 py-2 text-sm">
          <p className="mb-2 text-xs font-medium text-slate-600">
            Select teams ({selectedIds.length} selected)
          </p>
          <ul className="space-y-1">
            {teams.map((t) => (
              <li key={t.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!selected[t.id]}
                  onChange={() => toggle(t.id)}
                  className="rounded border-slate-400"
                />
                <span className="text-slate-800">
                  {t.name}
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
        Choose the final three reviewers for this team. Partial assignments are pre-filled so you can add the rest.
        Reviewers not in your list are removed only if they have not submitted; team members cannot review their own
        team.
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
            Select team{filteredTeams.length > 0 ? ` (${filteredTeams.length})` : ""}
          </label>
          <div className="mt-1 max-h-40 overflow-y-auto rounded border border-slate-200 px-2 py-2 text-sm">
            {filteredTeams.length === 0 ? (
              <p className="px-1 py-2 text-xs text-slate-500">No teams match the current filters.</p>
            ) : (
              <ul className="space-y-0.5">
                {filteredTeams.map((t) => (
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
