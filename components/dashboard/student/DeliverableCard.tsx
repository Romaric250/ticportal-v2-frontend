"use client";

import { Upload, FileText, CheckCircle, XCircle, Clock, AlertCircle, Edit2, ExternalLink } from "lucide-react";
import { type TeamDeliverable, type DeliverableDeadlineStatus } from "../../../../src/lib/services/teamService";

interface DeliverableCardProps {
  deliverable: TeamDeliverable;
  deadlineStatus?: DeliverableDeadlineStatus;
  onSubmit: () => void;
  onUpdate: () => void;
}

export function DeliverableCard({ deliverable, deadlineStatus, onSubmit, onUpdate }: DeliverableCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <CheckCircle size={12} />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
            <XCircle size={12} />
            Rejected
          </span>
        );
      case "PENDING":
        return (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
            <Clock size={12} />
            Pending Review
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            <AlertCircle size={12} />
            Not Submitted
          </span>
        );
    }
  };

  const isSubmitted = deliverable.content && deliverable.content.length > 0;
  const canSubmit = !deadlineStatus?.passed;
  const canUpdate = isSubmitted && canSubmit && deliverable.status === "PENDING";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-slate-900">{deliverable.template.title}</h3>
            {deliverable.template.required && (
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                Required
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 mb-3">{deliverable.template.description}</p>
          
          <div className="flex items-center gap-3 flex-wrap mb-3">
            {getStatusBadge(isSubmitted ? deliverable.status : "NOT_SUBMITTED")}
            <span className="text-xs text-slate-500">
              Content Type: <span className="font-medium">{deliverable.template.contentType}</span>
            </span>
          </div>

          <div className="space-y-2">
            {deliverable.template.dueDate && (
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                <span className="text-xs text-slate-600">
                  Due: {new Date(deliverable.template.dueDate).toLocaleDateString()}
                </span>
                {deadlineStatus && (
                  <span className={`text-xs font-medium ${
                    deadlineStatus.passed ? "text-red-600" : "text-emerald-600"
                  }`}>
                    {deadlineStatus.passed ? "Deadline Passed" : deadlineStatus.timeRemaining}
                  </span>
                )}
              </div>
            )}

            {isSubmitted && deliverable.submittedAt && (
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-slate-400" />
                <span className="text-xs text-slate-600">
                  Submitted: {new Date(deliverable.submittedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {deliverable.feedback && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-medium text-amber-800 mb-1">Feedback:</p>
              <p className="text-sm text-amber-900">{deliverable.feedback}</p>
            </div>
          )}

          {isSubmitted && deliverable.content && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-700 mb-1">Current Submission:</p>
              {deliverable.contentType === "FILE" || deliverable.contentType === "URL" ? (
                <a
                  href={deliverable.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 break-all"
                >
                  {deliverable.content}
                  <ExternalLink size={12} />
                </a>
              ) : (
                <p className="text-sm text-slate-700 line-clamp-2">{deliverable.content}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        {!isSubmitted && canSubmit && (
          <button
            onClick={onSubmit}
            className="cursor-pointer flex-1 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937] transition-colors flex items-center justify-center gap-2"
          >
            <Upload size={14} />
            Submit
          </button>
        )}
        {canUpdate && (
          <button
            onClick={onUpdate}
            className="cursor-pointer flex-1 rounded-lg border border-[#111827] bg-white px-4 py-2.5 text-sm font-medium text-[#111827] hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <Edit2 size={14} />
            Update
          </button>
        )}
        {!canSubmit && !isSubmitted && (
          <div className="flex-1 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 text-center">
            Deadline Passed
          </div>
        )}
      </div>
    </div>
  );
}
