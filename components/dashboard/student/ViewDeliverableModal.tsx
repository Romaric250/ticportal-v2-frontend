"use client";

import { X, CheckCircle, XCircle, Clock, ExternalLink, FileText, Link as LinkIcon, Type } from "lucide-react";
import { type TeamDeliverable } from "@/src/lib/services/teamService";

interface ViewDeliverableModalProps {
  deliverable: TeamDeliverable;
  onClose: () => void;
}

export function ViewDeliverableModal({ deliverable, onClose }: ViewDeliverableModalProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle size={18} className="text-emerald-500" />;
      case "REJECTED":
        return <XCircle size={18} className="text-red-500" />;
      case "PENDING":
        return <Clock size={18} className="text-amber-500" />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (!deliverable.content) {
      return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-500">No content submitted yet</p>
        </div>
      );
    }

    if (deliverable.contentType === "FILE" || deliverable.contentType === "URL") {
      return (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500 mb-1">
              {deliverable.contentType === "FILE" ? "File URL" : "External URL"}
            </p>
            <a
              href={deliverable.content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 break-all"
            >
              {deliverable.content}
              <ExternalLink size={14} />
            </a>
          </div>
          <button
            onClick={() => window.open(deliverable.content, "_blank")}
            className="cursor-pointer w-full rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937] transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink size={16} />
            Open {deliverable.contentType === "FILE" ? "File" : "URL"}
          </button>
        </div>
      );
    }

    if (deliverable.contentType === "TEXT") {
      return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 max-h-[500px] overflow-y-auto">
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed break-words">
              {deliverable.content}
            </p>
          </div>
        </div>
      );
    }

    // Fallback for legacy fileUrl
    if (deliverable.fileUrl) {
      return (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500 mb-1">File URL</p>
            <a
              href={deliverable.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 break-all"
            >
              {deliverable.fileUrl}
              <ExternalLink size={14} />
            </a>
          </div>
          <button
            onClick={() => window.open(deliverable.fileUrl, "_blank")}
            className="cursor-pointer w-full rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937] transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink size={16} />
            Open File
          </button>
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-500">No content available</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Deliverable Details</h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Deliverable Information
                </label>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-base font-bold text-slate-900 mb-1">{deliverable.template.title}</p>
                  <p className="text-sm text-slate-600">{deliverable.template.description}</p>
                  {deliverable.template.required && (
                    <span className="inline-flex items-center mt-2 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                      Required
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Content Type
                </label>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    {deliverable.template.contentType === "FILE" && <FileText size={16} className="text-blue-500" />}
                    {deliverable.template.contentType === "URL" && <LinkIcon size={16} className="text-blue-500" />}
                    {deliverable.template.contentType === "TEXT" && <Type size={16} className="text-blue-500" />}
                    <span className="text-sm font-medium text-slate-900">{deliverable.template.contentType}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Status
                </label>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(deliverable.status  as string)}
                    <span className="text-sm font-medium text-slate-900">{deliverable.status}</span>
                  </div>
                </div>
              </div>

              {deliverable.template.dueDate && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Due Date
                  </label>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-900">
                      {new Date(deliverable.template.dueDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {deliverable.description && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Description
                  </label>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-700 leading-relaxed">{deliverable.description}</p>
                  </div>
                </div>
              )}

              {deliverable.submittedAt && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Submitted At
                  </label>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-900">
                      {new Date(deliverable.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {deliverable.feedback && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Feedback
                  </label>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-900 leading-relaxed">{deliverable.feedback}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Content
                </label>
                {renderContent()}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

