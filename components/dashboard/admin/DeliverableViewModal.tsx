"use client";

import { X, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";
import { type TeamDeliverable } from "../../../../src/lib/services/adminService";

interface DeliverableViewModalProps {
  deliverable: TeamDeliverable;
  onClose: () => void;
}

export function DeliverableViewModal({ deliverable, onClose }: DeliverableViewModalProps) {
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
    if (deliverable.contentType === "FILE" && deliverable.fileUrl) {
      return (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500 mb-1">File URL</p>
            <a
              href={deliverable.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all inline-flex items-center gap-1"
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

    if (deliverable.contentType === "URL" && deliverable.content) {
      return (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500 mb-1">URL</p>
            <a
              href={deliverable.content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all inline-flex items-center gap-1"
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
            Open URL
          </button>
        </div>
      );
    }

    if (deliverable.contentType === "TEXT" && deliverable.content) {
      return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 max-h-96 overflow-y-auto">
          <p className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">
            {deliverable.content}
          </p>
        </div>
      );
    }

    if (deliverable.fileUrl) {
      return (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500 mb-1">File URL</p>
            <a
              href={deliverable.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all inline-flex items-center gap-1"
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
          <h2 className="text-xl font-semibold text-slate-900">Deliverable Details</h2>
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
                  Team Information
                </label>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-base font-semibold text-slate-900">{deliverable.teamName}</p>
                  <p className="text-sm text-slate-600 mt-1">{deliverable.projectTitle}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Deliverable Type
                </label>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-sm font-medium text-slate-900">{deliverable.type}</p>
                  {deliverable.contentType && (
                    <p className="text-xs text-slate-500 mt-1">
                      Content: <span className="font-medium">{deliverable.contentType}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Status
                </label>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(deliverable.status)}
                    <span className="text-sm font-medium text-slate-900">{deliverable.status}</span>
                  </div>
                </div>
              </div>

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

