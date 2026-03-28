"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { gradingService } from "../../src/lib/services/gradingService";
import { TeamSearchPicker } from "./TeamSearchPicker";
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
  const [autoConfirmOpen, setAutoConfirmOpen] = useState(false);
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
      const res = await gradingService.autoAssign({});
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
      if (n === 0 && errList.length === 0 && skipped.length === 0) {
        toast.message("Nothing to assign — every team already has two reviewers, or there are no teams.");
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
      if (partnerRow && replacementId === partnerRow.reviewerId) {
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

  const partnerRow =
    unassignModal && assignments
      ? assignments.find(
          (x) => x.teamId === unassignModal.teamId && x.reviewerId !== unassignModal.reviewerId
        )
      : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Assignments</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Auto-assign pairs, manual assign or swap reviewers, or unassign draft slots. Per-reviewer caps live under{" "}
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
            This will assign <strong className="text-slate-900">two reviewers per team</strong> that do not yet have a
            full pair, using a fair workload split. Reviewers who are on a team will not be assigned to that team.
          </p>
          <ul className="list-inside list-disc space-y-1 text-xs text-slate-500">
            <li>Teams that already have two assignments are skipped.</li>
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
              The <strong className="text-slate-900">other reviewer’s scores</strong> are not changed — only pairing
              metadata is updated when you replace someone.
            </p>
            {partnerRow ? (
              <>
                <p className="text-xs text-slate-500">
                  Other reviewer on this team: {partnerRow.reviewer.firstName} {partnerRow.reviewer.lastName} (
                  {partnerRow.reviewer.email}).
                </p>
                <UserSearchPicker
                  label="Replace with another reviewer (optional)"
                  value={replacementId}
                  onChange={(id) => setReplacementId(id)}
                  disabled={!!unassigningId}
                />
                <p className="text-xs text-slate-500">
                  If you pick someone, they become the new partner for this team. Leave empty to only remove this
                  reviewer (the team may have one reviewer until you assign again).
                </p>
              </>
            ) : (
              <p className="text-xs text-amber-800">
                This team has no other assignment row yet — you can only remove this reviewer; add a full pair
                afterward with Manual assign.
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

function ManualAssignForm({ onSuccess }: { onSuccess: () => void }) {
  const [teamId, setTeamId] = useState<string | null>(null);
  const [r1, setR1] = useState<string | null>(null);
  const [r2, setR2] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [teamPairHint, setTeamPairHint] = useState<string | null>(null);
  const [loadingTeamReviewers, setLoadingTeamReviewers] = useState(false);

  useEffect(() => {
    if (!teamId) {
      setR1(null);
      setR2(null);
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
          setTeamPairHint("No reviewers on this team yet — choose two reviewers below.");
        } else if (sorted.length === 1) {
          setR1(sorted[0].reviewerId);
          setR2(null);
          setTeamPairHint(
            `One reviewer already assigned (${sorted[0].firstName} ${sorted[0].lastName}). Pick the second reviewer, or change both slots.`
          );
        } else {
          setR1(sorted[0].reviewerId);
          setR2(sorted[1].reviewerId);
          setTeamPairHint(
            "This team already has two reviewers — saving updates the pair (draft-only reviewers can be swapped)."
          );
        }
      } catch {
        if (!cancelled) {
          setR1(null);
          setR2(null);
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
    if (!teamId || !r1 || !r2) {
      toast.error("Select a team and two reviewers");
      return;
    }
    if (r1 === r2) {
      toast.error("Choose two different reviewers");
      return;
    }
    setSubmitting(true);
    try {
      await gradingService.manualAssign([{ teamId, reviewerIds: [r1, r2] }]);
      toast.success("Assignments saved");
      onSuccess();
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "response" in e ? (e as any).response?.data?.message : null;
      toast.error(msg || "Manual assign failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pt-1">
      <p className="text-xs text-slate-500">
        Choose the final pair for this team. Teams with only one reviewer are pre-filled so you add the second (or
        replace both). Reviewers not in your list are removed only if they have not submitted; team members cannot
        review their own team.
      </p>
      <TeamSearchPicker label="Team" value={teamId} onChange={(id) => setTeamId(id)} disabled={submitting} />
      {teamId && loadingTeamReviewers && (
        <p className="text-xs text-slate-500">Loading current reviewers…</p>
      )}
      {teamPairHint && !loadingTeamReviewers && (
        <p className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900">{teamPairHint}</p>
      )}
      <UserSearchPicker label="Reviewer 1" value={r1} onChange={(id) => setR1(id)} disabled={submitting} />
      <UserSearchPicker label="Reviewer 2" value={r2} onChange={(id) => setR2(id)} disabled={submitting} />
      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          disabled={submitting}
          onClick={submit}
          className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Assign pair"}
        </button>
      </div>
    </div>
  );
}
