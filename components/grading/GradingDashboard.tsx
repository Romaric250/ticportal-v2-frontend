"use client";

import { useCallback, useEffect, useState } from "react";
import { gradingService, type ReviewerDashboardData } from "../../src/lib/services/gradingService";
import { GradingForm, type RubricSection } from "./GradingForm";
import { toast } from "sonner";

export function GradingDashboard() {
  const [data, setData] = useState<ReviewerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rubricSections, setRubricSections] = useState<RubricSection[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, r] = await Promise.all([gradingService.reviewerDashboard(), gradingService.getRubric()]);
      setData(dash);
      const raw = r?.sections as { sections?: RubricSection[] } | undefined;
      setRubricSections(Array.isArray(raw?.sections) ? raw.sections : []);
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "response" in e ? (e as any).response?.data?.message : null;
      toast.error(msg || "Could not load reviewer dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-slate-600">Loading…</p>;
  }

  if (!data) {
    return <p className="text-sm text-red-600">No data</p>;
  }

  const sections = rubricSections;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">{data.reviewer.name}</h2>
        <p className="text-xs text-slate-500">{data.reviewer.email}</p>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
          <span>Assigned: {data.stats.totalAssigned}</span>
          <span>Done: {data.stats.completed}</span>
          <span>Pending: {data.stats.pending}</span>
        </div>
      </div>

      {!sections.length && (
        <p className="text-sm text-amber-700">No active rubric yet. Ask an admin to publish one.</p>
      )}

      {data.assignedTeams.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">No teams assigned to you yet</p>
          <p className="mt-1 text-amber-800/90">
            Contact an administrator to be assigned to teams in Judging → Assignments. Teams appear here after you are
            paired on a submission.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {data.assignedTeams.map((t) => (
          <div key={t.teamId} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{t.teamName}</h3>
                {t.projectTitle && <p className="text-xs text-slate-500">{t.projectTitle}</p>}
              </div>
              <div className="text-right text-xs text-slate-600">
                <div>Status: {t.grade?.status ?? "—"}</div>
                {t.pairedReviewer && (
                  <div className="mt-1">
                    Pair: {t.pairedReviewer.name} — {t.pairedReviewer.submitted ? "submitted" : "not submitted"}
                  </div>
                )}
              </div>
            </div>

            {t.deliverables.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Deliverables</p>
                <ul className="space-y-1 text-xs text-slate-700">
                  {t.deliverables.map((d) => (
                    <li key={d.id} className="rounded bg-slate-50 px-2 py-1">
                      <span className="font-medium">{d.templateTitle ?? d.type}</span> — {d.submissionStatus}
                      {d.content?.startsWith("http") ? (
                        <a href={d.content} className="ml-1 text-sky-700 underline" target="_blank" rel="noreferrer">
                          Open link
                        </a>
                      ) : d.content ? (
                        <span className="ml-1 text-slate-600">{d.content.slice(0, 120)}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {sections.length > 0 && (
              <div className="mt-4">
                <button
                  type="button"
                  className="text-xs font-medium text-sky-700 underline"
                  onClick={() => setExpanded((x) => (x === t.teamId ? null : t.teamId))}
                >
                  {expanded === t.teamId ? "Hide grading form" : "Grade this team"}
                </button>
                {expanded === t.teamId && (
                  <div className="mt-4 max-w-[1200px]">
                    <GradingForm
                      key={`${t.teamId}-${t.grade?.id ?? "new"}`}
                      teamId={t.teamId}
                      teamName={t.teamName}
                      sections={sections}
                      deliverables={t.deliverables}
                      initialSectionScores={(t.grade?.sectionScores as Record<string, unknown>) ?? null}
                      initialFeedback={t.grade?.feedback ?? null}
                      status={t.grade?.status}
                      onSubmitted={load}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">All teams</h2>
        <p className="text-xs text-slate-500">{data.assignedTeams.length} teams assigned.</p>
      </div>
    </div>
  );
}
