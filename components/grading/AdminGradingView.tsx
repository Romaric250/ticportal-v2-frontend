"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { gradingService, type PendingTeam } from "../../src/lib/services/gradingService";
import { Modal } from "../ui/modal";
import { JudgingTableSkeleton } from "./grading-skeletons";

function statusLabel(s: string) {
  if (s === "READY_TO_FINALIZE") return "Ready to finalize";
  if (s === "PENDING") return "In progress";
  return s.replace(/_/g, " ");
}

function scoreText(v: number | null | undefined) {
  if (v == null) return "—";
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

export function AdminGradingView() {
  const [pending, setPending] = useState<PendingTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [submittedFilter, setSubmittedFilter] = useState<"all" | "both" | "not_both">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "READY_TO_FINALIZE" | "PENDING">("all");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [confirm, setConfirm] = useState<PendingTeam | null>(null);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await gradingService.pendingGrades();
      setPending(data);
      setSelected({});
    } catch {
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let rows = pending;
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (t) =>
          t.teamName.toLowerCase().includes(q) ||
          (t.projectTitle && t.projectTitle.toLowerCase().includes(q))
      );
    }
    if (submittedFilter === "both") {
      rows = rows.filter((t) => t.submittedCount >= 3);
    } else if (submittedFilter === "not_both") {
      rows = rows.filter((t) => t.submittedCount < 3);
    }
    if (statusFilter !== "all") {
      rows = rows.filter((t) => t.status === statusFilter);
    }
    return rows;
  }, [pending, search, submittedFilter, statusFilter]);

  const finalizableInView = useMemo(
    () => filtered.filter((t) => t.canFinalize).map((t) => t.teamId),
    [filtered]
  );

  const selectedFinalizableIds = useMemo(
    () => finalizableInView.filter((id) => selected[id]),
    [finalizableInView, selected]
  );

  const toggleRow = (teamId: string, canFinalize: boolean) => {
    if (!canFinalize) return;
    setSelected((s) => ({ ...s, [teamId]: !s[teamId] }));
  };

  const selectAllFinalizable = () => {
    const allOn = finalizableInView.length > 0 && finalizableInView.every((id) => selected[id]);
    const next: Record<string, boolean> = { ...selected };
    for (const id of finalizableInView) {
      next[id] = !allOn;
    }
    setSelected(next);
  };

  const runFinalize = async (teamId: string) => {
    setActing(true);
    try {
      const res = await gradingService.finalize(teamId);
      toast.success("Finalized");
      const w = res?.scoreDifferenceWarning;
      if (w) toast.message(w);
      await load();
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg || "Finalize failed");
    } finally {
      setActing(false);
      setConfirm(null);
    }
  };

  const runBulkFinalize = async () => {
    if (selectedFinalizableIds.length === 0) return;
    setActing(true);
    try {
      const result = await gradingService.finalizeBulk(selectedFinalizableIds);
      const ok = result.succeeded.length;
      const bad = result.failed.length;
      if (ok) toast.success(`Finalized ${ok} team(s)`);
      if (bad) {
        result.failed.forEach((f) => toast.error(`${f.teamId}: ${f.message}`));
      }
      setBulkConfirmOpen(false);
      await load();
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg || "Bulk finalize failed");
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 md:p-6">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Finalize grades</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          After <strong className="text-slate-800">all three reviewers submit</strong>, you can finalize to average their
          scores and blend leaderboard points (see Leaderboard tab for weight and points cap). Only teams with three
          submitted scores can be finalized.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
          />
        </div>
        <label className="flex flex-col gap-1 text-xs text-slate-600">
          Submissions
          <select
            value={submittedFilter}
            onChange={(e) => setSubmittedFilter(e.target.value as "all" | "both" | "not_both")}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900"
          >
            <option value="all">All</option>
            <option value="both">All three reviewers submitted</option>
            <option value="not_both">Not all three submitted</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-600">
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900"
          >
            <option value="all">All</option>
            <option value="READY_TO_FINALIZE">Ready to finalize</option>
            <option value="PENDING">In progress</option>
          </select>
        </label>
      </div>

      {!loading && finalizableInView.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={selectAllFinalizable}
            className="text-xs font-medium text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
          >
            {finalizableInView.every((id) => selected[id]) ? "Deselect all" : "Select all ready"}
          </button>
          <button
            type="button"
            disabled={selectedFinalizableIds.length === 0 || acting}
            onClick={() => setBulkConfirmOpen(true)}
            className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-900 disabled:opacity-40"
          >
            Finalize selected ({selectedFinalizableIds.length})
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-lg bg-white p-2">
          <JudgingTableSkeleton rows={5} cols={9} />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm text-slate-900">
            <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-700">
              <tr>
                <th className="w-10 px-2 py-2.5"> </th>
                <th className="px-3 py-2.5">Team</th>
                <th className="px-3 py-2.5">Score 1</th>
                <th className="px-3 py-2.5">Score 2</th>
                <th className="px-3 py-2.5">Score 3</th>
                <th className="px-3 py-2.5">Submitted</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Finalize</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-slate-500">
                    {pending.length === 0
                      ? "No teams waiting for grading actions."
                      : "No teams match your filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.teamId} className="hover:bg-slate-50">
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        disabled={!t.canFinalize || acting}
                        checked={!!selected[t.teamId]}
                        onChange={() => toggleRow(t.teamId, t.canFinalize)}
                        className="rounded border-slate-400"
                        title={t.canFinalize ? "Include in bulk finalize" : "All three reviewers must submit first"}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{t.teamName}</div>
                      {t.projectTitle && <div className="text-xs text-slate-500">{t.projectTitle}</div>}
                    </td>
                    <td className="px-3 py-2 tabular-nums text-emerald-800">{scoreText(t.score1)}</td>
                    <td className="px-3 py-2 tabular-nums text-emerald-800">{scoreText(t.score2)}</td>
                    <td className="px-3 py-2 tabular-nums text-emerald-800">{scoreText(t.score3)}</td>
                    <td className="px-3 py-2 tabular-nums text-slate-700">
                      {t.submittedCount}/{t.gradeCount}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{statusLabel(t.status)}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        disabled={!t.canFinalize || acting}
                        onClick={() => setConfirm(t)}
                        className="rounded-md bg-black px-2.5 py-1 text-xs font-medium text-white hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Finalize
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!confirm}
        onClose={() => !acting && setConfirm(null)}
        title="Finalize grade"
        variant="light"
        className="max-w-md"
      >
        {confirm && (
          <div className="space-y-4 pt-1">
            <p className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">{confirm.teamName}</span>
              {confirm.projectTitle && (
                <span className="block text-xs text-slate-500">{confirm.projectTitle}</span>
              )}
            </p>
            <p className="text-sm text-slate-600">
              This will average the three submitted reviewer scores, apply the leaderboard blend, and store the official
              final score.
            </p>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={acting}
                onClick={() => setConfirm(null)}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={acting}
                onClick={() => void runFinalize(confirm.teamId)}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {acting ? "Working…" : "Confirm finalize"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={bulkConfirmOpen}
        onClose={() => !acting && setBulkConfirmOpen(false)}
        title="Finalize multiple teams"
        variant="light"
        className="max-w-md"
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm text-slate-600">
            Finalize <strong className="text-slate-900">{selectedFinalizableIds.length}</strong> team(s)? Each must
            already have three submitted reviewer scores.
          </p>
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={acting}
              onClick={() => setBulkConfirmOpen(false)}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={acting || selectedFinalizableIds.length === 0}
              onClick={() => void runBulkFinalize()}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {acting ? "Working…" : "Confirm bulk finalize"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
