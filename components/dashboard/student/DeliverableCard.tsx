"use client";

import { Upload, FileText, CheckCircle, XCircle, Clock, AlertCircle, Edit2, Eye, Trash2, ExternalLink } from "lucide-react";
import { type TeamDeliverable, type DeliverableDeadlineStatus } from "../../../../src/lib/services/teamService";

interface DeliverableCardProps {
  deliverable: TeamDeliverable;
  deadlineStatus?: DeliverableDeadlineStatus;
  onSubmit: () => void;
  onUpdate: () => void;
  onView: () => void;
  onDelete: () => void;
}

export function DeliverableCard({ deliverable, deadlineStatus, onSubmit, onUpdate, onView, onDelete }: DeliverableCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle size={14} />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            <XCircle size={14} />
            Rejected
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            <Clock size={14} />
            Pending Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <AlertCircle size={14} />
            Not Submitted
          </span>
        );
    }
  };

  const isSubmitted = deliverable.content && deliverable.content.length > 0;
  const canSubmit = !deadlineStatus?.passed;
  const canUpdate = isSubmitted && canSubmit && deliverable.status === "PENDING";
  const canDelete = isSubmitted && canSubmit && (deliverable.status === "PENDING" || deliverable.status === "REJECTED");

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-slate-300">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-2">
              {deliverable.template.title}
            </h3>
            {deliverable.template.required && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                Required
              </span>
            )}
          </div>
          {getStatusBadge(isSubmitted ? deliverable.status : "NOT_SUBMITTED")}
        </div>
        <p className="text-sm text-slate-600 line-clamp-2 mt-2">
          {deliverable.template.description}
        </p>
      </div>

      {/* Content Type Badge */}
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          <FileText size={12} />
          {deliverable.template.contentType}
        </span>
      </div>

      {/* Deadline & Submission Info */}
      <div className="mb-4 space-y-2 border-t border-slate-100 pt-4">
        {deliverable.template.dueDate && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-400" />
              <span className="text-xs text-slate-600">
                Due: {new Date(deliverable.template.dueDate).toLocaleDateString()}
              </span>
            </div>
            {deadlineStatus && (
              <span className={`text-xs font-semibold ${
                deadlineStatus.passed ? "text-red-600" : "text-emerald-600"
              }`}>
                {deadlineStatus.passed ? "Passed" : deadlineStatus.timeRemaining}
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

      {/* Feedback Section */}
      {deliverable.feedback && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-800 mb-1">Feedback:</p>
          <p className="text-sm text-amber-900 line-clamp-2">{deliverable.feedback}</p>
        </div>
      )}

      {/* Current Submission Preview */}
      {isSubmitted && deliverable.content && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-700 mb-1.5">Current Submission:</p>
          {deliverable.contentType === "FILE" || deliverable.contentType === "URL" ? (
            <a
              href={deliverable.content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 break-all line-clamp-1"
              onClick={(e) => e.stopPropagation()}
            >
              {deliverable.content}
              <ExternalLink size={12} />
            </a>
          ) : (
            <p className="text-sm text-slate-700 line-clamp-2">{deliverable.content}</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
        {isSubmitted && (
          <button
            onClick={onView}
            className="cursor-pointer flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
            title="View Details"
          >
            <Eye size={14} />
            View
          </button>
        )}
        
        {!isSubmitted && canSubmit && (
          <button
            onClick={onSubmit}
            className="cursor-pointer flex-1 rounded-lg bg-[#111827] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1f2937] transition-colors flex items-center justify-center gap-1.5"
          >
            <Upload size={14} />
            Submit
          </button>
        )}

        {canUpdate && (
          <button
            onClick={onUpdate}
            className="cursor-pointer flex-1 rounded-lg border border-[#111827] bg-white px-3 py-2 text-xs font-semibold text-[#111827] hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Edit2 size={14} />
            Update
          </button>
        )}

        {canDelete && (
          <button
            onClick={onDelete}
            className="cursor-pointer rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
            title="Delete Submission"
          >
            <Trash2 size={14} />
          </button>
        )}

        {!canSubmit && !isSubmitted && (
          <div className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 text-center">
            Deadline Passed
          </div>
        )}
      </div>
    </div>
  );
}
