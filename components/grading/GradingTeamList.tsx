"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, CircleDashed } from "lucide-react";
import { gradingService, type ReviewerDashboardData } from "../../src/lib/services/gradingService";
import { toast } from "sonner";
import { GradingListSkeleton } from "./grading-skeletons";

type Props = {
  gradingBasePath: string;
};

/** Shared scale: 12px card padding, 12px section gap, 8px inner rows, 11px micro labels */
const labelMicro = "text-[11px] font-medium uppercase tracking-wider leading-4 text-slate-500";
const valueSm = "mt-1 text-sm font-semibold leading-5 text-slate-900";
const valueXs = "mt-1 text-xs font-medium leading-5";

function isYourReviewDone(status?: string | null) {
  return status === "SUBMITTED" || status === "AVERAGED" || status === "PUBLISHED";
}

function statusLabel(s?: string) {
  if (!s) return "Not started";
  if (s === "SUBMITTED") return "Submitted";
  if (s === "IN_PROGRESS") return "In progress";
  if (s === "AVERAGED" || s === "PUBLISHED") return "Reviewed";
  return s.replace(/_/g, " ");
}

function StatPair({
  label,
  value,
  valueClass,
  variant = "dark",
}: {
  label: string;
  value: string | number;
  valueClass?: string;
  variant?: "dark" | "light";
}) {
  const labelCls = variant === "dark" ? "text-slate-400" : "text-slate-500";
  const defaultValue = variant === "dark" ? "text-slate-100" : "text-slate-900";
  return (
    <div className="min-w-0">
      <p className={`text-xs font-medium ${labelCls}`}>{label}</p>
      <p className={`mt-0.5 text-sm font-semibold tabular-nums ${valueClass ?? defaultValue}`}>{value}</p>
    </div>
  );
}

export function GradingTeamList({ gradingBasePath }: Props) {
  const [data, setData] = useState<ReviewerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const dash = await gradingService.reviewerDashboard();
      setData(dash);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg || "Could not load teams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const teamsOrdered = useMemo(() => {
    if (!data?.assignedTeams) return [];
    return [...data.assignedTeams].sort(
      (a, b) => Number(isYourReviewDone(a.grade?.status)) - Number(isYourReviewDone(b.grade?.status))
    );
  }, [data]);

  if (loading) {
    return <GradingListSkeleton />;
  }

  if (!data) {
    return <p className="text-sm text-red-700">Unable to load reviewer data.</p>;
  }

  return (
    <div className="w-full space-y-8">
      <header className="rounded-xl border border-slate-800 bg-[#111827] px-4 py-4 text-white md:px-5 md:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider leading-4 text-slate-400">Reviewer</p>
            <h2 className="mt-1 text-base font-semibold leading-6 tracking-tight text-white md:text-lg">{data.reviewer.name}</h2>
            <p className="mt-0.5 text-sm leading-5 text-slate-400">{data.reviewer.email}</p>
          </div>
          <div
            className="flex flex-wrap gap-x-8 gap-y-3 border-t border-slate-700/90 pt-3 sm:gap-x-10 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
            role="group"
            aria-label="Assignment stats"
          >
            <StatPair label="Assigned" value={data.stats.totalAssigned} />
            <StatPair label="Done" value={data.stats.completed} valueClass="text-emerald-300" />
            <StatPair label="Pending" value={data.stats.pending} valueClass="text-amber-200/95" />
          </div>
        </div>
      </header>

      {data.assignedTeams.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">No teams assigned yet</p>
          <p className="mt-1 text-amber-900/90">Ask an administrator to assign you in Judging → Assignments.</p>
        </div>
      )}

      {data.assignedTeams.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="px-4 pt-4">
            <h3 className="text-sm font-semibold leading-5 text-slate-900">Teams to review</h3>
            <p className="mt-0.5 text-xs leading-4 text-slate-600">Open a team to score rubric sections step by step.</p>
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-3 px-4 pb-4 sm:grid-cols-2">
            {teamsOrdered.map((t) => {
              const href = `${gradingBasePath}/${encodeURIComponent(t.teamId)}`;
              const done = isYourReviewDone(t.grade?.status);
              const scoreLabel =
                t.grade?.totalScore != null && done ? `${Number(t.grade.totalScore).toFixed(1)} / 100` : null;
              return (
                <li key={t.teamId} className="flex min-w-0">
                  <Link
                    href={href}
                    className={`group flex min-h-0 w-full flex-col rounded-xl border bg-white p-3 transition-colors hover:border-slate-300 ${
                      done ? "border-emerald-200 ring-1 ring-emerald-100/80" : "border-amber-200 ring-1 ring-amber-100/90"
                    }`}
                  >
                    <div className="flex min-h-0 flex-1 flex-col gap-3">
                      <div
                        className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 ${
                          done ? "bg-emerald-50/90" : "bg-amber-50/90"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          {done ? (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                          ) : (
                            <CircleDashed className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
                          )}
                          <div className="min-w-0">
                            <p className={`text-xs font-semibold ${done ? "text-emerald-900" : "text-amber-900"}`}>
                              {done ? "You submitted your review" : "Your review still needed"}
                            </p>
                            {scoreLabel ? (
                              <p className="text-[11px] font-medium text-emerald-800/90">Your score: {scoreLabel}</p>
                            ) : (
                              <p className="text-[11px] text-amber-800/80">Open the team to complete the rubric.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="border-l-[3px] border-[#111827] pl-2.5">
                        <p className={labelMicro}>Grade team</p>
                        <p className={`${valueSm} line-clamp-2`}>{t.teamName}</p>
                        {t.projectTitle ? (
                          <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-slate-600">{t.projectTitle}</p>
                        ) : (
                          <p className="mt-0.5 text-xs leading-4 text-slate-500">No project title</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-x-3">
                        <div className="min-w-0">
                          <p className={labelMicro}>Rubric status</p>
                          <p
                            className={`${valueSm} ${done ? "text-emerald-700" : "text-slate-900"}`}
                          >
                            {statusLabel(t.grade?.status)}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className={labelMicro}>Deliverables</p>
                          <p className={`${valueSm} tabular-nums`}>{t.deliverables.length}</p>
                        </div>
                      </div>

                      <div className="mt-auto flex flex-col gap-3">
                        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className={labelMicro}>Pair reviewer</p>
                          {t.pairedReviewer ? (
                            <p className={`${valueXs} text-slate-900`}>
                              {t.pairedReviewer.name}
                              <span className="font-normal text-slate-500">
                                {" "}
                                · {t.pairedReviewer.submitted ? "submitted" : "not submitted"}
                              </span>
                            </p>
                          ) : (
                            <p className={`${valueXs} text-slate-500`}>—</p>
                          )}
                        </div>
                        <div className="flex items-center justify-center gap-1.5 rounded-md bg-[#111827] px-3 py-2 text-sm font-medium leading-5 text-white">
                          <span className="group-hover:underline">Review</span>
                          <ArrowRight size={16} strokeWidth={2} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
