"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gradingService } from "../../src/lib/services/gradingService";
import { cn } from "../../src/utils/cn";

export type DeliverableForReview = {
  id: string;
  type: string;
  contentType: string;
  content: string;
  submissionStatus: string;
  templateTitle?: string;
};

export type RubricCriterion = {
  name: string;
  maxScore: number;
  description?: string;
  evaluationPoints?: string[];
  scoringGuide?: Record<string, string>;
};

export type RubricSection = {
  name: string;
  weight: number;
  criteria: RubricCriterion[];
};

type Props = {
  teamId: string;
  teamName: string;
  sections: RubricSection[];
  deliverables?: DeliverableForReview[];
  initialSectionScores?: Record<string, unknown> | null;
  initialFeedback?: string | null;
  status?: string;
  readOnly?: boolean;
  onSubmitted?: () => void;
  compactChrome?: boolean;
};

const REVIEW_COMMENT_MIN = 10;
const DRAFT_KEY = (id: string) => `tic-grading-draft-${id}`;

function normalizeKey(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function findDeliverableForSection(sectionName: string, deliverables: DeliverableForReview[]) {
  const n = normalizeKey(sectionName);
  const exact = deliverables.find((d) => normalizeKey(d.templateTitle ?? "") === n);
  if (exact) return exact;
  return deliverables.find((d) => {
    const t = normalizeKey(d.templateTitle ?? "");
    return t.includes(n) || n.includes(t);
  });
}

function scoreOptions(maxScore: number): number[] {
  const m = Math.max(0, Math.floor(maxScore));
  return Array.from({ length: m + 1 }, (_, i) => i);
}

export function GradingForm({
  teamId,
  teamName,
  sections,
  deliverables = [],
  initialSectionScores,
  initialFeedback,
  status,
  readOnly,
  onSubmitted,
  compactChrome,
}: Props) {
  const totalSlides = sections.length + 1;
  const [activeSlide, setActiveSlide] = useState(0);
  const [reviewComment, setReviewComment] = useState(() => initialFeedback?.trim() ?? "");
  const [scores, setScores] = useState<Record<string, Record<string, { score: number | null; maxScore: number }>>>(() =>
    buildInitial(sections, initialSectionScores)
  );
  const [saving, setSaving] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const formTopRef = useRef<HTMLDivElement>(null);
  const scrollAfterNextRef = useRef(false);

  /** Cannot edit scores / comment (submitted or admin read-only). Navigation between slides still allowed when locked. */
  const locked = readOnly || status === "SUBMITTED" || status === "AVERAGED" || status === "PUBLISHED";
  const disabled = locked;

  useLayoutEffect(() => {
    if (!scrollAfterNextRef.current) return;
    scrollAfterNextRef.current = false;
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeSlide]);

  useEffect(() => {
    if (typeof window === "undefined" || disabled) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY(teamId));
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        scores?: typeof scores;
        reviewComment?: string;
        activeSlide?: number;
      };
      if (draft.scores && typeof draft.scores === "object") setScores(draft.scores);
      if (typeof draft.reviewComment === "string") setReviewComment(draft.reviewComment);
      if (typeof draft.activeSlide === "number" && draft.activeSlide >= 0 && draft.activeSlide < totalSlides) {
        setActiveSlide(draft.activeSlide);
      }
    } catch {
      /* ignore */
    }
  }, [teamId, disabled, totalSlides]);

  useEffect(() => {
    if (typeof window === "undefined" || disabled) return;
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY(teamId),
          JSON.stringify({ scores, reviewComment, activeSlide, updatedAt: Date.now() })
        );
      } catch {
        /* ignore */
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [teamId, scores, reviewComment, activeSlide, disabled]);

  const sectionPayload = useMemo(() => buildSectionPayload(sections, scores), [sections, scores]);

  const validateSection = (sectionIndex: number): string | null => {
    const s = sections[sectionIndex];
    if (!s) return "Invalid section";
    for (const c of s.criteria) {
      const sc = scores[s.name]?.[c.name]?.score;
      if (sc === null || sc === undefined || Number.isNaN(sc)) {
        return `Select a score for “${c.name}”.`;
      }
      if (sc < 0 || sc > c.maxScore) {
        return `Score for “${c.name}” must be between 0 and ${c.maxScore}.`;
      }
    }
    return null;
  };

  const validateAll = (): string | null => {
    for (let i = 0; i < sections.length; i++) {
      const e = validateSection(i);
      if (e) return e;
    }
    const t = reviewComment.trim();
    if (t.length < REVIEW_COMMENT_MIN) {
      return `Add a review comment (at least ${REVIEW_COMMENT_MIN} characters).`;
    }
    return null;
  };

  const handleSaveContinue = () => {
    if (disabled) return;
    if (activeSlide < sections.length) {
      const err = validateSection(activeSlide);
      if (err) {
        toast.error(err);
        return;
      }
      toast.success("Section saved");
      scrollAfterNextRef.current = true;
      setActiveSlide((s) => Math.min(s + 1, totalSlides - 1));
      return;
    }
  };

  const openSubmitConfirm = () => {
    if (locked) return;
    const err = validateAll();
    if (err) {
      toast.error(err);
      return;
    }
    setConfirmSubmitOpen(true);
  };

  const executeSubmit = async () => {
    if (locked) return;
    setConfirmSubmitOpen(false);
    setSaving(true);
    try {
      await gradingService.submitGrade(teamId, sectionPayload, reviewComment.trim());
      try {
        localStorage.removeItem(DRAFT_KEY(teamId));
      } catch {
        /* ignore */
      }
      toast.success("Review submitted");
      onSubmitted?.();
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg || "Failed to submit");
    } finally {
      setSaving(false);
    }
  };

  const hasDeliverables = deliverables.length > 0;
  const isReviewSlide = activeSlide === sections.length;
  const currentSection = sections[activeSlide];

  return (
    <div
      ref={formTopRef}
      className={cn(
        "scroll-mt-4 rounded-xl border border-slate-200 bg-slate-100/90 p-4 md:p-5",
        compactChrome ? "space-y-5" : "space-y-6"
      )}
    >
      {!compactChrome && (
        <div className="rounded-lg border border-slate-200/80 bg-white px-4 py-4 md:px-5">
          <h3 className="text-base font-semibold text-slate-900">{teamName}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Use each step for one rubric block. Save and continue when the section is complete, then add your final
            comment on the last step.
          </p>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">Progress</p>
        <div className="flex gap-1.5">
          {Array.from({ length: totalSlides }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (locked) {
                  setActiveSlide(i);
                  return;
                }
                if (i < activeSlide) setActiveSlide(i);
              }}
              className={cn(
                "h-1.5 min-w-0 flex-1 rounded-full transition-colors",
                i === activeSlide ? "bg-[#111827]" : i < activeSlide ? "bg-slate-400" : "bg-slate-200",
                locked || i < activeSlide ? "cursor-pointer hover:opacity-90" : "cursor-default",
                !locked && i > activeSlide && "pointer-events-none opacity-90"
              )}
              aria-label={i < sections.length ? `Section ${i + 1}` : "Review comment"}
              aria-current={i === activeSlide ? "step" : undefined}
            />
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {!isReviewSlide && currentSection && (
          <SectionSlide
            section={currentSection}
            sectionIndex={activeSlide}
            totalSections={sections.length}
            deliverables={deliverables}
            hasDeliverables={hasDeliverables}
            scores={scores}
            setScores={setScores}
            disabled={disabled}
          />
        )}

        {isReviewSlide && (
          <div className="border-t border-slate-200 bg-slate-50 p-5 md:p-6">
            <div className="rounded-lg border border-slate-200 bg-white p-4 md:p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Final step</p>
              <h4 className="mt-1 text-lg font-semibold text-slate-900">Review comment</h4>
              <p className="mt-1 text-xs text-slate-600">
                Summarize strengths, gaps, and guidance. Minimum {REVIEW_COMMENT_MIN} characters.
              </p>
              <textarea
                disabled={disabled}
                className={cn(
                  "mt-4 min-h-[140px] w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]/15",
                  disabled && "cursor-not-allowed bg-slate-100"
                )}
                placeholder="Write your review for this team…"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">
                {reviewComment.trim().length} / {REVIEW_COMMENT_MIN}+ characters
              </p>
            </div>
          </div>
        )}
      </div>

      {locked ? (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setActiveSlide((s) => Math.max(0, s - 1))}
            disabled={activeSlide === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} />
            Back
          </button>
          <button
            type="button"
            onClick={() => setActiveSlide((s) => Math.min(totalSlides - 1, s + 1))}
            disabled={activeSlide >= totalSlides - 1}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setActiveSlide((s) => Math.max(0, s - 1))}
            disabled={activeSlide === 0 || saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} />
            Back
          </button>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            {!isReviewSlide && (
              <button
                type="button"
                onClick={handleSaveContinue}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1f2937] disabled:opacity-60"
              >
                {activeSlide === sections.length - 1 ? "Continue to review" : "Save & continue"}
                <ChevronRight size={18} />
              </button>
            )}
            {isReviewSlide && (
              <button
                type="button"
                onClick={openSubmitConfirm}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-lg bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1f2937] disabled:opacity-60"
              >
                Submit review
              </button>
            )}
          </div>
        </div>
      )}

      {confirmSubmitOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="presentation"
          onClick={() => !saving && setConfirmSubmitOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="grading-submit-confirm-title"
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="grading-submit-confirm-title" className="text-lg font-semibold text-slate-900">
              Submit this review?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Once submitted, you will not be able to change your scores or review comment. Are you sure you want to
              continue?
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => setConfirmSubmitOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void executeSubmit()}
                className="rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1f2937] disabled:opacity-60"
              >
                {saving ? "Submitting…" : "Yes, submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionSlide({
  section,
  sectionIndex,
  totalSections,
  deliverables,
  hasDeliverables,
  scores,
  setScores,
  disabled,
}: {
  section: RubricSection;
  sectionIndex: number;
  totalSections: number;
  deliverables: DeliverableForReview[];
  hasDeliverables: boolean;
  scores: Record<string, Record<string, { score: number | null; maxScore: number }>>;
  setScores: Dispatch<
    SetStateAction<Record<string, Record<string, { score: number | null; maxScore: number }>>>
  >;
  disabled: boolean;
}) {
  const matched = hasDeliverables ? findDeliverableForSection(section.name, deliverables) : undefined;

  return (
    <div>
      <div className="border-b border-slate-800/20 bg-[#111827] px-5 py-4 text-white">
        <p className="text-xs font-medium text-slate-400">
          Section {sectionIndex + 1} of {totalSections}
        </p>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="text-base font-semibold text-white">{section.name}</h4>
          <span className="rounded-full border border-slate-600 bg-slate-800/80 px-2.5 py-0.5 text-xs font-medium text-slate-200">
            Weight {section.weight}
          </span>
        </div>
        {matched && (
          <p className="mt-2 text-xs text-emerald-300/95">
            Linked to: <span className="font-medium text-emerald-200">{matched.templateTitle ?? matched.type}</span>
          </p>
        )}
        {!matched && hasDeliverables && (
          <p className="mt-2 text-xs text-amber-200/95">No deliverable title matched this section — check template names.</p>
        )}
      </div>

      <div className={cn("grid gap-0 bg-slate-100/60", hasDeliverables ? "lg:grid-cols-2 lg:divide-x lg:divide-slate-200" : "")}>
        {hasDeliverables && (
          <div className="border-b border-slate-200 bg-slate-100 p-5 lg:border-b-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Submission</p>
            {matched ? (
              <DeliverableBlock d={matched} />
            ) : (
              <ul className="mt-3 space-y-3">
                {deliverables.map((d) => (
                  <li key={d.id}>
                    <DeliverableBlock d={d} compact />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Scores</p>
          <div className="mt-4 space-y-4">
            {section.criteria.map((c) => {
              const row = scores[section.name]?.[c.name];
              const val = row?.score;
              const opts = scoreOptions(c.maxScore);
              return (
                <div key={c.name} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                      {c.description && <p className="text-xs leading-relaxed text-slate-600">{c.description}</p>}
                      {c.evaluationPoints && c.evaluationPoints.length > 0 && (
                        <ul className="list-inside list-disc space-y-0.5 text-xs text-slate-600">
                          {c.evaluationPoints.map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      )}
                      {c.scoringGuide && Object.keys(c.scoringGuide).length > 0 && (
                        <div className="rounded-lg bg-[#111827] px-3 py-2.5 text-xs">
                          <p className="font-medium text-white">Scoring guide</p>
                          <ul className="mt-1.5 space-y-0.5 text-slate-300">
                            {Object.entries(c.scoringGuide).map(([k, v]) => (
                              <li key={k}>
                                <span className="font-mono text-slate-400">{k}</span>
                                <span>: {v}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col gap-1 lg:items-end">
                      <label className="text-xs font-medium text-slate-600">Score (0–{c.maxScore})</label>
                      <select
                        disabled={disabled}
                        className={cn(
                          "min-w-[10rem] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/15",
                          disabled && "cursor-not-allowed bg-slate-100 text-slate-500"
                        )}
                        value={val === null || val === undefined ? "" : String(val)}
                        onChange={(e) => {
                          const v = e.target.value;
                          setScores((prev) => ({
                            ...prev,
                            [section.name]: {
                              ...prev[section.name],
                              [c.name]: {
                                score: v === "" ? null : Number(v),
                                maxScore: c.maxScore,
                              },
                            },
                          }));
                        }}
                      >
                        <option value="">Select score…</option>
                        {opts.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DeliverableBlock({ d, compact }: { d: DeliverableForReview; compact?: boolean }) {
  const isUrl = d.content?.startsWith("http");
  return (
    <div className={cn("mt-3 rounded-lg border border-slate-200 bg-white p-3 text-sm", compact && "mt-0")}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-900">{d.templateTitle ?? d.type}</span>
        <span
          className={cn(
            "rounded border px-1.5 py-0.5 font-medium",
            d.submissionStatus === "SUBMITTED" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-slate-100 text-slate-700"
          )}
        >
          {d.submissionStatus}
        </span>
        <span className="text-slate-500">{d.contentType}</span>
      </div>
      {d.content && (
        <div className="mt-2 text-xs text-slate-700">
          {isUrl ? (
            <a href={d.content} className="break-all font-medium text-sky-800 underline" target="_blank" rel="noreferrer">
              Open submission link
            </a>
          ) : (
            <p className={cn("whitespace-pre-wrap text-slate-600", compact ? "line-clamp-4" : "max-h-72 overflow-y-auto")}>
              {d.content}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function buildInitial(
  sections: RubricSection[],
  initial?: Record<string, unknown> | null
): Record<string, Record<string, { score: number | null; maxScore: number }>> {
  const out: Record<string, Record<string, { score: number | null; maxScore: number }>> = {};
  for (const s of sections) {
    out[s.name] = {};
    const fromInit = initial?.[s.name] as { criteria?: Record<string, { score?: number; maxScore?: number }> } | undefined;
    for (const c of s.criteria) {
      const prev = fromInit?.criteria?.[c.name]?.score;
      out[s.name][c.name] = {
        score: typeof prev === "number" && !Number.isNaN(prev) ? prev : null,
        maxScore: c.maxScore,
      };
    }
  }
  return out;
}

function buildSectionPayload(
  sections: RubricSection[],
  scores: Record<string, Record<string, { score: number | null; maxScore: number }>>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const s of sections) {
    const criteria: Record<string, { score: number; maxScore: number; feedback?: string }> = {};
    let sum = 0;
    let maxSum = 0;
    for (const c of s.criteria) {
      const sc = scores[s.name]?.[c.name]?.score ?? 0;
      const safe = typeof sc === "number" ? sc : 0;
      criteria[c.name] = { score: safe, maxScore: c.maxScore };
      sum += safe;
      maxSum += c.maxScore;
    }
    payload[s.name] = {
      score: sum,
      maxScore: maxSum,
      feedback: "",
      criteria,
    };
  }
  return payload;
}
