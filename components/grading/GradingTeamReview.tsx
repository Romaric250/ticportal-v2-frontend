"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { gradingService, type ReviewerDashboardData } from "../../src/lib/services/gradingService";
import { GradingForm, type RubricSection } from "./GradingForm";
import { GradingFormSkeleton } from "./grading-skeletons";

type Props = {
  teamId: string;
  backHref: string;
};

function statusLabel(s?: string) {
  if (!s) return "Not started";
  if (s === "SUBMITTED") return "Submitted";
  if (s === "IN_PROGRESS") return "In progress";
  return s.replace(/_/g, " ");
}

export function GradingTeamReview({ teamId, backHref }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReviewerDashboardData | null>(null);
  const [sections, setSections] = useState<RubricSection[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, r] = await Promise.all([gradingService.reviewerDashboard(), gradingService.getRubric()]);
      setData(dash);
      const raw = r?.sections as { sections?: RubricSection[] } | undefined;
      setSections(Array.isArray(raw?.sections) ? raw.sections : []);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg || "Could not load grading");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <GradingFormSkeleton />;
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center">
        <p className="text-sm font-medium text-slate-900">Unable to load reviewer data</p>
        <Link href={backHref} className="mt-3 inline-block text-sm font-medium text-slate-700 underline">
          Back to list
        </Link>
      </div>
    );
  }

  const team = data.assignedTeams.find((t) => t.teamId === teamId);

  if (!team) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center">
        <p className="text-sm font-medium text-slate-900">Team not found</p>
        <p className="mt-1 text-xs text-slate-600">This team is not assigned to you or the link is invalid.</p>
        <Link href={backHref} className="mt-4 inline-block text-sm font-medium text-slate-800 underline">
          Back to all teams
        </Link>
      </div>
    );
  }

  if (!sections.length) {
    return (
      <div className="space-y-4">
        <Link
          href={backHref}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-semibold leading-5 text-white transition-colors hover:bg-[#1f2937]"
        >
          <ChevronLeft size={18} />
          Back to all teams
        </Link>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
          No active rubric yet. Ask an administrator to publish one in Judging settings.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Link
        href={backHref}
        className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-semibold leading-5 text-white transition-colors hover:bg-[#1f2937]"
      >
        <ChevronLeft size={18} />
        Back to all teams
      </Link>

      <header className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="h-1 bg-[#111827]" aria-hidden />
        <div className="p-3 md:p-4">
          <div className="flex flex-col gap-3">
            <div className="border-l-[3px] border-[#111827] pl-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wider leading-4 text-slate-500">Grade team</p>
              <h1 className="mt-1 text-lg font-semibold leading-6 tracking-tight text-slate-900 md:text-xl">{team.teamName}</h1>
              {team.projectTitle ? (
                <p className="mt-0.5 text-sm leading-5 text-slate-600">{team.projectTitle}</p>
              ) : (
                <p className="mt-0.5 text-sm leading-5 text-slate-500">No project title</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3" role="group" aria-label="Team summary">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider leading-4 text-slate-500">Status</p>
                <p className="mt-1 text-sm font-semibold leading-5 text-slate-900">{statusLabel(team.grade?.status)}</p>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider leading-4 text-slate-500">Deliverables</p>
                <p className="mt-1 text-sm font-semibold leading-5 tabular-nums text-slate-900">{team.deliverables.length}</p>
              </div>
            </div>

            <div className="w-fit max-w-md rounded-md bg-[#111827] px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wider leading-4 text-slate-400">Review panel</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Until you submit your grade, you only see whether others have submitted — not their scores.
              </p>
              {(() => {
                const peers =
                  team.otherReviewers && team.otherReviewers.length > 0
                    ? team.otherReviewers
                    : team.pairedReviewer
                      ? [team.pairedReviewer]
                      : [];
                return peers.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-xs font-medium leading-5 text-white">
                    {peers.map((o, i) => (
                      <li key={`o-${i}`}>
                        {o.name}
                        <span className="font-normal text-slate-400">
                          {" "}
                          · {o.submitted ? "submitted" : "not submitted"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-xs leading-5 text-slate-500">—</p>
                );
              })()}
            </div>
          </div>
        </div>
      </header>

      {team.deliverables.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-slate-50/80">
          <div className="border-b border-slate-200 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Submission overview</h2>
            <p className="mt-0.5 text-xs text-slate-600">Open links before scoring the matching rubric step.</p>
          </div>
          <ul className="divide-y divide-slate-200">
            {team.deliverables.map((d) => (
              <li key={d.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{d.templateTitle ?? d.type}</p>
                  <p className="text-xs text-slate-500">{d.contentType}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={
                      d.submissionStatus === "SUBMITTED"
                        ? "rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-900"
                        : "rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700"
                    }
                  >
                    {d.submissionStatus}
                  </span>
                  {d.content?.startsWith("http") ? (
                    <a
                      href={d.content}
                      className="text-xs font-semibold text-sky-800 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open link
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <GradingForm
        key={`${team.teamId}-${team.grade?.id ?? "new"}`}
        teamId={team.teamId}
        teamName={team.teamName}
        sections={sections}
        deliverables={team.deliverables}
        initialSectionScores={(team.grade?.sectionScores as Record<string, unknown>) ?? null}
        initialFeedback={team.grade?.feedback ?? null}
        status={team.grade?.status}
        compactChrome
        onSubmitted={() => {
          load();
          router.refresh();
        }}
      />
    </div>
  );
}
