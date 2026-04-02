"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { Eye, ExternalLink, FileDown, FilterX, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  gradingService,
  type GradingReportPayload,
  type GradingReportTeamDetail,
  type GradingReportTeamRow,
} from "../../src/lib/services/gradingService";
import { adminService } from "../../src/lib/services/adminService";
import { exportGradingReportPdf } from "../../src/utils/exportToPdf";
import { Modal } from "../ui/modal";
import { JudgingTableSkeleton } from "./grading-skeletons";

function statusLabel(s?: string) {
  if (!s) return "—";
  if (s === "SUBMITTED") return "Submitted";
  if (s === "IN_PROGRESS") return "In progress";
  return s.replace(/_/g, " ");
}

function scoreText(v: number | null | undefined) {
  if (v == null) return "—";
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

function parseOptFloat(s: string): number | null {
  const t = s.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function parseOptInt(s: string): number | null {
  const t = s.trim();
  if (t === "") return null;
  const n = parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
}

/** Normalized leaderboard is 0–100; show as score out of 10 (e.g. 6.61/10). */
function leaderboardScoreOutOfTen(normalizedLeaderboard: number | undefined | null): string {
  const n = normalizedLeaderboard ?? 0;
  const outOf10 = (n / 100) * 10;
  return `${outOf10.toFixed(2)}/10`;
}

/** Live computed total (weighted rubric avg + LB) or stored final when ranking supplies it. */
function computedFinalScore(row: GradingReportTeamRow): number | null {
  return row.blendFinal ?? row.finalScore ?? null;
}

/** How many of the three reviewer score slots are filled (non-null). */
function countFilledReviewerScores(row: GradingReportTeamRow): number {
  return [row.score1, row.score2, row.score3].filter((s) => s != null).length;
}

type ReportSortCol =
  | "serverRank"
  | "teamName"
  | "school"
  | "region"
  | "final"
  | "revAvg"
  | "wtdRev"
  | "lbPts"
  | "lbNorm"
  | "rawLb"
  | "submissions"
  | "published";

function compareReportRows(
  a: GradingReportTeamRow,
  b: GradingReportTeamRow,
  col: ReportSortCol,
  dir: "asc" | "desc",
): number {
  const m = dir === "asc" ? 1 : -1;
  const str = (x: string | null | undefined) => (x ?? "").toLowerCase();
  const tie = () => a.teamName.localeCompare(b.teamName, undefined, { sensitivity: "base" });
  switch (col) {
    case "serverRank":
      return m * (a.rank - b.rank) || tie();
    case "teamName":
      return m * str(a.teamName).localeCompare(str(b.teamName), undefined, { sensitivity: "base" }) || tie();
    case "school":
      return m * str(a.school).localeCompare(str(b.school), undefined, { sensitivity: "base" }) || tie();
    case "region":
      return m * str(a.region).localeCompare(str(b.region), undefined, { sensitivity: "base" }) || tie();
    case "final": {
      const va = computedFinalScore(a) ?? -Infinity;
      const vb = computedFinalScore(b) ?? -Infinity;
      if (va === vb) return tie();
      return m * (va < vb ? -1 : 1);
    }
    case "revAvg": {
      const va = a.reviewerAverageScore ?? -Infinity;
      const vb = b.reviewerAverageScore ?? -Infinity;
      if (va === vb) return tie();
      return m * (va < vb ? -1 : 1);
    }
    case "wtdRev": {
      const va = a.reviewerContributionPoints ?? -Infinity;
      const vb = b.reviewerContributionPoints ?? -Infinity;
      if (va === vb) return tie();
      return m * (va < vb ? -1 : 1);
    }
    case "lbPts": {
      const va = a.leaderboardContributionPoints ?? -Infinity;
      const vb = b.leaderboardContributionPoints ?? -Infinity;
      if (va === vb) return tie();
      return m * (va < vb ? -1 : 1);
    }
    case "lbNorm": {
      const va = a.normalizedLeaderboard ?? -Infinity;
      const vb = b.normalizedLeaderboard ?? -Infinity;
      if (va === vb) return tie();
      return m * (va < vb ? -1 : 1);
    }
    case "rawLb": {
      const va = a.rawLeaderboardPoints ?? -Infinity;
      const vb = b.rawLeaderboardPoints ?? -Infinity;
      if (va === vb) return tie();
      return m * (va < vb ? -1 : 1);
    }
    case "submissions": {
      const va = a.submittedDeliverableCount ?? 0;
      const vb = b.submittedDeliverableCount ?? 0;
      if (va === vb) return tie();
      return m * (va - vb);
    }
    case "published": {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      if (ta === tb) return tie();
      return m * (ta - tb);
    }
    default:
      return tie();
  }
}

export function GradingReport() {
  const [payload, setPayload] = useState<GradingReportPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [rankMin, setRankMin] = useState("");
  const [rankMax, setRankMax] = useState("");
  const [finalMin, setFinalMin] = useState("");
  const [finalMax, setFinalMax] = useState("");
  const [lbMin, setLbMin] = useState("");
  const [lbMax, setLbMax] = useState("");
  const [rawLbMin, setRawLbMin] = useState("");
  const [rawLbMax, setRawLbMax] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<"all" | "yes" | "no">("all");
  const [threeScoresFilter, setThreeScoresFilter] = useState<"all" | "0" | "1" | "2" | "3">("all");
  const [reportRegion, setReportRegion] = useState("");
  const [regionListFromStats, setRegionListFromStats] = useState<string[]>([]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTeamRow, setSelectedTeamRow] = useState<GradingReportTeamRow | null>(null);
  const [detail, setDetail] = useState<GradingReportTeamDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [deletingGrade, setDeletingGrade] = useState<{ teamId: string; reviewerId: string; reviewerName: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [exportOpen, setExportOpen] = useState(false);
  const [excludeIds, setExcludeIds] = useState<Record<string, boolean>>({});
  const [topN, setTopN] = useState("");
  const [sortColumn, setSortColumn] = useState<ReportSortCol>("final");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = reportRegion.trim();
      const data = await gradingService.gradingReports(r ? { region: r } : undefined);
      setPayload(data ?? null);
    } catch (e: unknown) {
      const msg = isAxiosError(e)
        ? e.message
        : e && typeof e === "object" && "message" in e
          ? String((e as { message?: string }).message)
          : "Could not load report";
      const isTimeout = isAxiosError(e) && (e.code === "ECONNABORTED" || /timeout/i.test(e.message ?? ""));
      setError(isTimeout ? "Request timed out. Try again." : msg);
      toast.error(isTimeout ? "Request timed out" : "Could not load report");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [reportRegion]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    void adminService
      .getUsersByRegionStats()
      .then((rows) => {
        if (!cancelled) {
          const names = rows.map((x) => x.region?.trim()).filter((x): x is string => Boolean(x));
          setRegionListFromStats([...new Set(names)].sort((a, b) => a.localeCompare(b)));
        }
      })
      .catch(() => {
        if (!cancelled) setRegionListFromStats([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const teams = payload?.teams ?? [];

  const regionDropdownOptions = useMemo(() => {
    const s = new Set<string>(regionListFromStats);
    for (const t of teams) {
      const reg = t.region?.trim();
      if (reg) s.add(reg);
    }
    const sel = reportRegion.trim();
    if (sel) s.add(sel);
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [regionListFromStats, teams, reportRegion]);

  const filtered = useMemo(() => {
    let list = teams;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.teamName.toLowerCase().includes(q) ||
          t.school.toLowerCase().includes(q) ||
          (t.projectTitle && t.projectTitle.toLowerCase().includes(q))
      );
    }

    const rMin = parseOptInt(rankMin);
    const rMax = parseOptInt(rankMax);
    if (rMin != null) list = list.filter((t) => t.rank >= rMin);
    if (rMax != null) list = list.filter((t) => t.rank <= rMax);

    const fMin = parseOptFloat(finalMin);
    const fMax = parseOptFloat(finalMax);
    if (fMin != null) list = list.filter((t) => (computedFinalScore(t) ?? -Infinity) >= fMin);
    if (fMax != null) list = list.filter((t) => (computedFinalScore(t) ?? -Infinity) <= fMax);

    const lMin = parseOptFloat(lbMin);
    const lMax = parseOptFloat(lbMax);
    if (lMin != null) list = list.filter((t) => (t.normalizedLeaderboard ?? 0) >= lMin);
    if (lMax != null) list = list.filter((t) => (t.normalizedLeaderboard ?? 0) <= lMax);

    const rlMin = parseOptFloat(rawLbMin);
    const rlMax = parseOptFloat(rawLbMax);
    if (rlMin != null) list = list.filter((t) => (t.rawLeaderboardPoints ?? 0) >= rlMin);
    if (rlMax != null) list = list.filter((t) => (t.rawLeaderboardPoints ?? 0) <= rlMax);

    if (publishedFilter === "yes") list = list.filter((t) => t.publishedAt != null);
    if (publishedFilter === "no") list = list.filter((t) => t.publishedAt == null);

    if (threeScoresFilter !== "all") {
      const want = Number(threeScoresFilter);
      list = list.filter((t) => countFilledReviewerScores(t) === want);
    }

    return list;
  }, [
    teams,
    search,
    rankMin,
    rankMax,
    finalMin,
    finalMax,
    lbMin,
    lbMax,
    rawLbMin,
    rawLbMax,
    publishedFilter,
    threeScoresFilter,
  ]);

  const sortedFiltered = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => compareReportRows(a, b, sortColumn, sortDir));
    return arr;
  }, [filtered, sortColumn, sortDir]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setRankMin("");
    setRankMax("");
    setFinalMin("");
    setFinalMax("");
    setLbMin("");
    setLbMax("");
    setRawLbMin("");
    setRawLbMax("");
    setPublishedFilter("all");
    setThreeScoresFilter("all");
    setReportRegion("");
    setSortColumn("final");
    setSortDir("desc");
  }, []);

  const openTeamDetail = useCallback(async (row: GradingReportTeamRow) => {
    setSelectedTeamRow(row);
    setDetail(null);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const d = await gradingService.gradingReportTeamDetail(row.teamId);
      setDetail(d);
    } catch {
      toast.error("Could not load team details");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    setDetail(null);
    setSelectedTeamRow(null);
  }, []);

  const confirmDeleteGrade = useCallback(async () => {
    if (!deletingGrade) return;
    setDeleteLoading(true);
    try {
      await gradingService.adminDeleteGrade(deletingGrade.teamId, deletingGrade.reviewerId);
      toast.success(`Deleted ${deletingGrade.reviewerName}'s review`);
      setDeletingGrade(null);
      closeDetail();
      load();
    } catch (e: unknown) {
      const msg = isAxiosError(e)
        ? e.response?.data?.message ?? e.message
        : "Could not delete grade";
      toast.error(msg);
    } finally {
      setDeleteLoading(false);
    }
  }, [deletingGrade, closeDetail, load]);

  const openExport = useCallback(() => {
    setExcludeIds({});
    setTopN("");
    setExportOpen(true);
  }, []);

  const hasActiveFilters =
    search.trim() !== "" ||
    rankMin.trim() !== "" ||
    rankMax.trim() !== "" ||
    finalMin.trim() !== "" ||
    finalMax.trim() !== "" ||
    lbMin.trim() !== "" ||
    lbMax.trim() !== "" ||
    rawLbMin.trim() !== "" ||
    rawLbMax.trim() !== "" ||
    publishedFilter !== "all" ||
    threeScoresFilter !== "all" ||
    reportRegion.trim() !== "" ||
    sortColumn !== "final" ||
    sortDir !== "desc";

  const runExport = useCallback(() => {
    let rows = sortedFiltered.filter((t) => !excludeIds[t.teamId]);
    const n = parseInt(topN, 10);
    if (!Number.isNaN(n) && n > 0) {
      rows = rows.slice(0, n);
    }
    if (rows.length === 0) {
      toast.error("Nothing to export — adjust filters.");
      return;
    }
    try {
      exportGradingReportPdf(rows, {
        filename: "grading-report.pdf",
        title: "Grading leaderboard",
        generatedAt: payload?.generatedAt,
      });
      toast.success("PDF downloaded");
      setExportOpen(false);
    } catch {
      toast.error("Could not create PDF");
    }
  }, [sortedFiltered, excludeIds, topN, payload?.generatedAt]);

  const modalTitle = detail?.teamName ?? selectedTeamRow?.teamName ?? "Team";

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-4 w-36 rounded bg-slate-200" />
            <div className="h-3 w-48 rounded bg-slate-100" />
          </div>
          <div className="h-8 w-24 rounded bg-slate-200" />
        </div>
        <div className="mb-3 h-10 w-full max-w-md rounded-lg bg-slate-100" />
        <JudgingTableSkeleton rows={6} cols={15} />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Reports & live ranking</h2>
          {payload?.generatedAt && (
            <p className="text-xs text-slate-500">Updated {new Date(payload.generatedAt).toLocaleString()}</p>
          )}
          <p className="mt-0.5 text-xs text-slate-600">
            <strong>Rev avg</strong> = unweighted mean of the three rubric totals (0–100). <strong>Wtd rev</strong> = that
            average × (100−w)% toward the final. <strong>Final</strong> = Wtd rev + LB pts (normalized LB × w%). Weights w
            come from Settings. Use <strong className="text-slate-800">Region</strong> in Filters to limit the report to a
            region (team lead region); ranks and scores reflect that subset.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openExport}
            disabled={sortedFiltered.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-black px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-900 disabled:opacity-50"
          >
            <FileDown className="h-3.5 w-3.5" />
            Export PDF
          </button>
          <button
            type="button"
            onClick={load}
            className="text-xs font-medium text-sky-800 underline"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">{error}</div>
      )}

      {!error && teams.length === 0 && (
        <p className="text-sm text-slate-600">No teams in the report yet.</p>
      )}

      {!error && teams.length > 0 && (
        <>
          <div className="mb-4 space-y-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-700">Filters</p>
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                <FilterX className="h-3.5 w-3.5" />
                Clear all
              </button>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search team, school, project…"
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              <label
                className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                title="Reloads report data: only teams whose lead region matches (same as admin team list)."
              >
                Region
                <select
                  value={reportRegion}
                  onChange={(e) => setReportRegion(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900"
                >
                  <option value="">All regions</option>
                  {regionDropdownOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Rank min
                <input
                  type="number"
                  min={1}
                  value={rankMin}
                  onChange={(e) => setRankMin(e.target.value)}
                  placeholder="—"
                  className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm text-slate-900"
                />
              </label>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Rank max
                <input
                  type="number"
                  min={1}
                  value={rankMax}
                  onChange={(e) => setRankMax(e.target.value)}
                  placeholder="—"
                  className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm text-slate-900"
                />
              </label>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Final min
                <input
                  type="number"
                  step="0.1"
                  value={finalMin}
                  onChange={(e) => setFinalMin(e.target.value)}
                  placeholder="0–100"
                  className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm text-slate-900"
                />
              </label>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Final max
                <input
                  type="number"
                  step="0.1"
                  value={finalMax}
                  onChange={(e) => setFinalMax(e.target.value)}
                  placeholder="—"
                  className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm text-slate-900"
                />
              </label>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                LB norm (0–100) min
                <input
                  type="number"
                  step="0.1"
                  value={lbMin}
                  onChange={(e) => setLbMin(e.target.value)}
                  placeholder="—"
                  className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm text-slate-900"
                />
              </label>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                LB norm (0–100) max
                <input
                  type="number"
                  step="0.1"
                  value={lbMax}
                  onChange={(e) => setLbMax(e.target.value)}
                  placeholder="—"
                  className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm text-slate-900"
                />
              </label>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Raw LB min
                <input
                  type="number"
                  step="1"
                  value={rawLbMin}
                  onChange={(e) => setRawLbMin(e.target.value)}
                  placeholder="—"
                  className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm text-slate-900"
                />
              </label>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Raw LB max
                <input
                  type="number"
                  step="1"
                  value={rawLbMax}
                  onChange={(e) => setRawLbMax(e.target.value)}
                  placeholder="—"
                  className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm text-slate-900"
                />
              </label>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Published
                <select
                  value={publishedFilter}
                  onChange={(e) => setPublishedFilter(e.target.value as "all" | "yes" | "no")}
                  className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900"
                >
                  <option value="all">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Reviewer scores filled
                <select
                  value={threeScoresFilter}
                  onChange={(e) =>
                    setThreeScoresFilter(e.target.value as "all" | "0" | "1" | "2" | "3")
                  }
                  className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900"
                >
                  <option value="all">Any</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap items-end gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <label className="min-w-[200px] flex-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Sort table by
                <select
                  value={sortColumn}
                  onChange={(e) => setSortColumn(e.target.value as ReportSortCol)}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
                >
                  <option value="final">Final score</option>
                  <option value="serverRank">Server rank (API)</option>
                  <option value="teamName">Team name</option>
                  <option value="school">School</option>
                  <option value="region">Region</option>
                  <option value="revAvg">Rev avg</option>
                  <option value="wtdRev">Wtd rev</option>
                  <option value="lbPts">LB pts</option>
                  <option value="lbNorm">LB norm (0–100)</option>
                  <option value="rawLb">Raw LB</option>
                  <option value="submissions">Submissions count</option>
                  <option value="published">Published date</option>
                </select>
              </label>
              <label className="w-[140px] text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Order
                <select
                  value={sortDir}
                  onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </label>
            </div>
            <p className="text-xs text-slate-500">
              Showing <strong className="text-slate-800">{sortedFiltered.length}</strong> of {teams.length} teams after
              filters. <strong className="text-slate-800">Table order</strong> and rank # follow the sort above (not the
              API rank unless you sort by &quot;Server rank&quot;).
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-[1180px] w-full divide-y divide-slate-200 text-left text-sm text-slate-900">
              <thead className="bg-black text-xs font-semibold uppercase tracking-wide text-white">
                <tr>
                  <th className="whitespace-nowrap px-2 py-2.5">Rank</th>
                  <th className="min-w-[140px] px-2 py-2.5">Team</th>
                  <th className="hidden px-2 py-2.5 lg:table-cell">School</th>
                  <th className="hidden px-2 py-2.5 xl:table-cell">Region</th>
                  <th className="whitespace-nowrap px-2 py-2.5">S1</th>
                  <th className="whitespace-nowrap px-2 py-2.5">S2</th>
                  <th className="whitespace-nowrap px-2 py-2.5">S3</th>
                  <th className="whitespace-nowrap px-2 py-2.5" title="Unweighted mean of three rubric totals (0–100)">
                    Rev avg
                  </th>
                  <th
                    className="whitespace-nowrap px-2 py-2.5 text-sky-200"
                    title="Review portion toward final: Rev avg × (100−w)%"
                  >
                    Wtd rev
                  </th>
                  <th className="whitespace-nowrap px-2 py-2.5" title="Leaderboard contribution toward final (normalized LB × w)">
                    LB pts
                  </th>
                  <th
                    className="whitespace-nowrap px-2 py-2.5 text-slate-300"
                    title="Leaderboard performance on a 0–10 scale (from normalized 0–100 index)"
                  >
                    LB /10
                  </th>
                  <th className="whitespace-nowrap px-2 py-2.5">Raw LB</th>
                  <th className="whitespace-nowrap px-2 py-2.5 text-emerald-300" title="Wtd rev + LB pts (0–100)">
                    Final
                  </th>
                  <th
                    className="whitespace-nowrap px-2 py-2.5"
                    title="Number of deliverables submitted (submissionStatus = SUBMITTED)"
                  >
                    Submissions
                  </th>
                  <th className="whitespace-nowrap px-2 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedFiltered.map((row, idx) => (
                  <tr key={row.teamId} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap bg-black px-2 py-2 text-sm font-semibold tabular-nums text-white">
                      #{idx + 1}
                    </td>
                    <td className="px-2 py-2">
                      <div className="font-medium text-slate-900">{row.teamName}</div>
                      {row.projectTitle && (
                        <div className="text-xs text-slate-500">{row.projectTitle}</div>
                      )}
                    </td>
                    <td className="hidden max-w-[160px] truncate px-2 py-2 text-slate-600 lg:table-cell">
                      {row.school || "—"}
                    </td>
                    <td className="hidden max-w-[100px] truncate px-2 py-2 text-slate-600 xl:table-cell">
                      {row.region?.trim() ? row.region : "—"}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 tabular-nums text-slate-700">{scoreText(row.score1)}</td>
                    <td className="whitespace-nowrap px-2 py-2 tabular-nums text-slate-700">{scoreText(row.score2)}</td>
                    <td className="whitespace-nowrap px-2 py-2 tabular-nums text-slate-700">{scoreText(row.score3)}</td>
                    <td className="whitespace-nowrap px-2 py-2 tabular-nums text-slate-700">
                      {scoreText(row.reviewerAverageScore)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 tabular-nums text-sky-900">
                      {row.reviewerContributionPoints != null ? row.reviewerContributionPoints.toFixed(2) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 tabular-nums text-emerald-800">
                      {(row.leaderboardContributionPoints ?? 0).toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 tabular-nums text-slate-500">
                      {leaderboardScoreOutOfTen(row.normalizedLeaderboard)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 tabular-nums text-slate-600">
                      {row.rawLeaderboardPoints ?? 0}
                    </td>
                    <td
                      className={
                        computedFinalScore(row) != null
                          ? "whitespace-nowrap px-2 py-2 font-semibold tabular-nums text-emerald-600"
                          : "whitespace-nowrap px-2 py-2 text-slate-400"
                      }
                    >
                      {computedFinalScore(row)?.toFixed(2) ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 tabular-nums text-slate-700">
                      {row.submittedDeliverableCount ?? 0}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => openTeamDetail(row)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-900"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedFiltered.length === 0 && (
            <p className="mt-3 text-center text-sm text-slate-600">No teams match your filters.</p>
          )}
        </>
      )}

      <Modal open={detailOpen} onClose={closeDetail} title={modalTitle} variant="light" className="max-w-2xl">
        {selectedTeamRow && (
          <div className="space-y-4">
            {detailLoading ? (
              <p className="text-center text-sm text-slate-600">Loading team data…</p>
            ) : detail?.deliverables && detail.deliverables.length > 0 ? (
              <section className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Team submissions (deliverables)
                </h3>
                <ul className="mt-3 space-y-3">
                  {detail.deliverables.map((d) => {
                    const isUrl =
                      d.contentType === "URL" ||
                      /^https?:\/\//i.test(d.content?.trim() ?? "");
                    const href = isUrl ? d.content.trim() : null;
                    return (
                      <li
                        key={d.id}
                        className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="font-medium text-slate-900">
                              {d.templateTitle ?? d.customType ?? d.type}
                            </span>
                            <span className="ml-2 text-xs text-slate-500">
                              {d.submissionStatus === "SUBMITTED" ? "Submitted" : "Not submitted"}
                            </span>
                          </div>
                          {href ? (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-sky-700 hover:underline"
                            >
                              Open link <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : null}
                        </div>
                        {d.description ? (
                          <p className="mt-1 text-xs text-slate-600">{d.description}</p>
                        ) : null}
                        {!href && d.content && d.contentType === "TEXT" ? (
                          <p className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap border-t border-slate-200 pt-2 text-xs text-slate-700">
                            {d.content}
                          </p>
                        ) : !href && d.content && !d.content.startsWith("http") ? (
                          <p className="mt-2 truncate text-xs text-slate-600" title={d.content}>
                            {d.content}
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : detail && (!detail.deliverables || detail.deliverables.length === 0) ? (
              <section className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Team submissions
                </h3>
                <p className="mt-2">No deliverables found for this team.</p>
              </section>
            ) : null}

            <section className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Scores</h3>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-slate-500">Rank (API / global)</dt>
                  <dd className="font-medium text-slate-900">#{selectedTeamRow.rank}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Final (Wtd rev + LB pts)</dt>
                  <dd
                    className={
                      computedFinalScore(selectedTeamRow) != null
                        ? "font-semibold tabular-nums text-emerald-600"
                        : "font-medium text-slate-400"
                    }
                  >
                    {computedFinalScore(selectedTeamRow)?.toFixed(2) ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Rev avg (unweighted)</dt>
                  <dd
                    className={
                      selectedTeamRow.reviewerAverageScore != null
                        ? "font-semibold tabular-nums text-emerald-600"
                        : "font-medium text-slate-400"
                    }
                  >
                    {scoreText(selectedTeamRow.reviewerAverageScore)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Wtd rev (×(100−w)%)</dt>
                  <dd className="font-semibold tabular-nums text-sky-800">
                    {selectedTeamRow.reviewerContributionPoints != null
                      ? selectedTeamRow.reviewerContributionPoints.toFixed(2)
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Scores 1 / 2 / 3</dt>
                  <dd className="font-medium tabular-nums text-slate-900">
                    {scoreText(selectedTeamRow.score1)} / {scoreText(selectedTeamRow.score2)} /{" "}
                    {scoreText(selectedTeamRow.score3)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Region</dt>
                  <dd className="text-slate-700">{selectedTeamRow.region?.trim() || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">LB pts</dt>
                  <dd className="font-semibold tabular-nums text-emerald-800">
                    {(selectedTeamRow.leaderboardContributionPoints ?? 0).toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">LB score · Raw LB</dt>
                  <dd className="text-slate-700">
                    {leaderboardScoreOutOfTen(selectedTeamRow.normalizedLeaderboard)} · {selectedTeamRow.rawLeaderboardPoints ?? 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Assignments</dt>
                  <dd className="font-medium text-slate-900">{selectedTeamRow.assignmentCount}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Deliverables submitted</dt>
                  <dd className="font-medium text-slate-900">{selectedTeamRow.submittedDeliverableCount ?? 0}</dd>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <dt className="text-xs text-slate-500">Published</dt>
                  <dd className="text-slate-600">
                    {selectedTeamRow.publishedAt
                      ? new Date(selectedTeamRow.publishedAt).toLocaleString()
                      : "—"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Reviewers</h3>
              {selectedTeamRow.reviewers.length === 0 ? (
                <p className="mt-2 text-sm text-slate-600">No reviewer grades yet.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {selectedTeamRow.reviewers.map((r) => (
                    <li
                      key={r.reviewerId}
                      className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-medium text-slate-900">{r.reviewerName}</span>
                          <span className="ml-2 text-xs text-slate-500">{r.email}</span>
                        </div>
                        <button
                          type="button"
                          title="Delete this reviewer's grade"
                          onClick={() =>
                            setDeletingGrade({
                              teamId: selectedTeamRow!.teamId,
                              reviewerId: r.reviewerId,
                              reviewerName: r.reviewerName,
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-600">
                        <span>
                          Score:{" "}
                          <strong
                            className={
                              r.totalScore != null ? "font-semibold text-emerald-700" : "text-slate-400"
                            }
                          >
                            {scoreText(r.totalScore)}
                          </strong>
                        </span>
                        <span className="text-slate-700">{statusLabel(r.status)}</span>
                      </div>
                      {r.feedback && (
                        <p className="mt-2 whitespace-pre-wrap border-t border-slate-200 pt-2 text-sm leading-relaxed text-slate-700">
                          {r.feedback}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {!detailLoading && detail && (
              <>
                <section className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Team</h3>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <p>
                      <span className="text-slate-500">School:</span> {detail.teamSchool || "—"}
                    </p>
                    {detail.projectTitle && (
                      <p>
                        <span className="text-slate-500">Project:</span> {detail.projectTitle}
                      </p>
                    )}
                    {detail.description && (
                      <p className="whitespace-pre-wrap">
                        <span className="text-slate-500">Description:</span> {detail.description}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">
                      Created {new Date(detail.createdAt).toLocaleString()}
                    </p>
                  </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Members</h3>
                  <ul className="mt-3 space-y-2">
                    {detail.members.map((m) => (
                      <li
                        key={m.userId}
                        className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs"
                      >
                        <div className="font-medium text-slate-900">{m.name}</div>
                        <div className="mt-1 grid gap-0.5 text-slate-600">
                          <span>{m.email}</span>
                          <span>Role: {m.role}</span>
                          <span>School: {m.school ?? "—"}</span>
                          <span>
                            Region: {m.region ?? "—"} · Country: {m.country ?? "—"}
                          </span>
                          {m.grade && <span>Grade: {m.grade}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal open={exportOpen} onClose={() => setExportOpen(false)} title="Export PDF" variant="light" className="max-w-md">
        <div className="space-y-4 text-sm">
          <p className="text-slate-600">
            Lists teams that pass your current report filters. Uncheck to exclude. Top N applies after exclusions (by
            current rank order).
          </p>
          <div className="rounded-lg border border-slate-200 bg-slate-100 px-4 py-3">
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Top N teams (optional)
            </label>
            <input
              type="number"
              min={1}
              value={topN}
              onChange={(e) => setTopN(e.target.value)}
              placeholder="All after exclusions"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
          <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <ul className="divide-y divide-slate-100">
              {sortedFiltered.map((t, i) => (
                <li
                  key={t.teamId}
                  className="flex items-center gap-3 px-3 py-2.5 text-xs transition hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={!excludeIds[t.teamId]}
                    onChange={(e) =>
                      setExcludeIds((prev) => ({ ...prev, [t.teamId]: !e.target.checked }))
                    }
                    id={`ex-${t.teamId}`}
                    className="rounded border-slate-400 text-slate-900 focus:ring-slate-500"
                  />
                  <label htmlFor={`ex-${t.teamId}`} className="flex-1 cursor-pointer text-slate-800">
                    <span className="font-medium text-slate-900">
                      #{i + 1} {t.teamName}
                    </span>
                    <span className="ml-2 text-slate-400">(API #{t.rank})</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setExportOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={runExport}
              className="rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-900"
            >
              Download PDF
            </button>
          </div>
        </div>
      </Modal>

      {deletingGrade && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Delete review</h3>
            <p className="mt-2 text-sm text-slate-600">
              This removes <strong>{deletingGrade.reviewerName}</strong>&apos;s grade and <strong>unassigns</strong> them
              from this team. You can assign another reviewer from Judging → Assignments.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingGrade(null)}
                disabled={deleteLoading}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteGrade}
                disabled={deleteLoading}
                className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleteLoading ? "Deleting…" : "Delete review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
