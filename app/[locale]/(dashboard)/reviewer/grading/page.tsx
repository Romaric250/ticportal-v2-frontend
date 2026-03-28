"use client";

import { useLocale } from "next-intl";
import { GradingTeamList } from "../../../../../components/grading/GradingTeamList";
import { ReviewerGradingGate } from "../../../../../components/grading/ReviewerGradingGate";

/** Canonical reviewer grading UI (same as legacy affiliate/grading — all roles use this path). */
export default function ReviewerGradingPage() {
  const locale = useLocale();
  return (
    <ReviewerGradingGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Review</h1>
          <p className="mt-1 text-sm text-slate-600">
            Open a team to score rubric sections step by step. Your pair&apos;s scores stay hidden until finalization.
          </p>
        </div>
        <GradingTeamList gradingBasePath={`/${locale}/reviewer/grading`} />
      </div>
    </ReviewerGradingGate>
  );
}
