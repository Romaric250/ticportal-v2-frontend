"use client";

import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { GradingTeamReview } from "../../../../../../components/grading/GradingTeamReview";
import { ReviewerGradingGate } from "../../../../../../components/grading/ReviewerGradingGate";

export default function ReviewerTeamGradingPage() {
  const params = useParams();
  const locale = useLocale();
  const raw = params.teamId;
  const teamId =
    typeof raw === "string" ? decodeURIComponent(raw) : Array.isArray(raw) ? decodeURIComponent(raw[0]) : "";
  const backHref = `/${locale}/reviewer/grading`;

  return (
    <ReviewerGradingGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Review</h1>
          <p className="mt-1 text-sm text-slate-600">
            Score each rubric section step by step, then add your review comment and submit.
          </p>
        </div>
        <GradingTeamReview teamId={teamId} backHref={backHref} />
      </div>
    </ReviewerGradingGate>
  );
}
