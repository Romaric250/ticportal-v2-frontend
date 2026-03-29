"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { gradingService } from "../../src/lib/services/gradingService";

/** Leaderboard blend + reviewer caps only (live ranking lives under Reports). */
export function LeaderboardConfig() {
  const [pct, setPct] = useState(10);
  const [pointsMax, setPointsMax] = useState(5000);
  /** Empty string = unlimited (null on server). */
  const [maxTeamsPerReviewer, setMaxTeamsPerReviewer] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const s = await gradingService.leaderboardConfigGet();
      setPct(s.leaderboardScorePercent);
      setPointsMax(s.leaderboardPointsMax ?? 5000);
      setMaxTeamsPerReviewer(s.maxTeamsPerReviewer != null ? String(s.maxTeamsPerReviewer) : "");
    } catch {
      toast.error("Could not load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const save = async () => {
    const trimmed = maxTeamsPerReviewer.trim();
    let maxTeamsPayload: number | null | undefined;
    if (trimmed === "") {
      maxTeamsPayload = null;
    } else {
      const n = Number(trimmed);
      if (!Number.isFinite(n) || n < 1 || !Number.isInteger(n)) {
        toast.error("Max teams per reviewer must be empty (unlimited) or a whole number ≥ 1");
        return;
      }
      maxTeamsPayload = n;
    }
    setSaving(true);
    try {
      await gradingService.leaderboardConfigPost({
        leaderboardScorePercent: pct,
        leaderboardPointsMax: pointsMax,
        maxTeamsPerReviewer: maxTeamsPayload,
      });
      toast.success("Saved");
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const apply = async () => {
    try {
      const res = await gradingService.leaderboardApply();
      const updated = (res as { updatedCount?: number })?.updatedCount;
      toast.success(`Re-applied blend to ${updated ?? "?"} finalized team(s). Open Reports to see rankings.`);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg || "Apply failed");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="h-4 w-48 rounded bg-slate-200" />
        <div className="h-10 max-w-md rounded bg-slate-100" />
        <div className="h-10 max-w-md rounded bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Leaderboard blend</h2>
        <p className="text-xs text-slate-600">
          Rubric scores are out of 100. Final grades use the <strong>unweighted average of three reviewers</strong>, then{" "}
          <strong>reviewer average × (100 − w)% + normalized leaderboard × w%</strong>, where <strong>w</strong> is the
          leaderboard share below (default <strong>10</strong> → <strong>90%</strong> from reviews, <strong>10%</strong> from
          the LB index). <strong>Reviewer pts</strong> and <strong>LB pts</strong> are those two contributions. The leaderboard
          index is{" "}
          <code className="rounded bg-slate-100 px-1">min(100, rawPoints / max × 100)</code> unless max is 0 (legacy relative
          mode). Under <strong className="text-slate-800">Reports</strong>, set a region to scope the live ranking and see how
          ranks change for that subset.
        </p>
        <div className="flex flex-wrap items-end gap-6">
          <label className="text-sm text-slate-700">
            Weight w (%)
            <input
              type="number"
              min={0}
              max={100}
              className="ml-2 w-20 rounded border border-slate-200 px-2 py-1 text-sm"
              value={pct}
              onChange={(e) => setPct(Number(e.target.value))}
            />
          </label>
          <label className="text-sm text-slate-700">
            Max raw points (full LB %)
            <input
              type="number"
              min={0}
              className="ml-2 w-28 rounded border border-slate-200 px-2 py-1 text-sm"
              value={pointsMax}
              onChange={(e) => setPointsMax(Number(e.target.value))}
            />
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="rounded-md bg-[#111827] px-3 py-2 text-sm text-white hover:bg-[#1f2937] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => void apply()}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
          >
            Re-apply to finalized teams
          </button>
        </div>
        <div className="border-t border-slate-100 pt-4">
          <h3 className="text-sm font-semibold text-slate-900">Reviewer assignment limits</h3>
          <p className="mt-1 text-xs text-slate-600">
            Limits how many teams each reviewer can have at once (auto-assign and new reviewers on manual assign). Leave empty
            for no limit.
          </p>
          <label className="mt-2 block text-sm text-slate-700">
            Max teams per reviewer
            <input
              type="text"
              inputMode="numeric"
              placeholder="Unlimited"
              className="ml-2 w-24 rounded border border-slate-200 px-2 py-1 text-sm"
              value={maxTeamsPerReviewer}
              onChange={(e) => setMaxTeamsPerReviewer(e.target.value.replace(/[^\d]/g, ""))}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
