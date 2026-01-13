"use client";

import { X, AlertTriangle, Trash2 } from "lucide-react";
import { type TeamDeliverable } from "@/src/lib/services/teamService";

interface DeleteDeliverableModalProps {
  deliverable: TeamDeliverable;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export function DeleteDeliverableModal({ deliverable, onClose, onConfirm, loading }: DeleteDeliverableModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">Delete Submission</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Are you sure you want to delete this submission?
              </h3>
              <p className="text-sm text-slate-600 mb-3">
                This will remove your submission for <span className="font-semibold">{deliverable.template.title}</span>.
                You can submit again before the deadline if needed.
              </p>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-medium text-amber-800">
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  Delete Submission
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

