"use client";

import { useState, useEffect } from "react";
import { X, BookOpen, Users, FileCheck, FileX } from "lucide-react";
import type { LearningPath } from "@/src/lib/services/learningPathService";

interface EditLearningPathModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    audience: "STUDENTS" | "MENTORS" | "EVERYONE";
    isCore: boolean;
    status: "DRAFT" | "ACTIVE";
  }) => void;
  loading: boolean;
  path: LearningPath | null;
}

export function EditLearningPathModal({ isOpen, onClose, onSubmit, loading, path }: EditLearningPathModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    audience: "STUDENTS" as "STUDENTS" | "MENTORS" | "EVERYONE",
    isCore: false,
    status: "DRAFT" as "DRAFT" | "ACTIVE",
  });

  // Update form data when path changes
  useEffect(() => {
    if (path) {
      setFormData({
        title: path.title,
        description: path.description,
        audience: path.audience,
        isCore: path.isCore,
        status: path.status || "DRAFT",
      });
    }
  }, [path]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  if (!isOpen || !path) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-lg sm:rounded-xl border border-slate-200 bg-white shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-lg bg-[#111827] p-1.5 sm:p-2">
                <BookOpen size={18} className="sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Edit Learning Path</h2>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Introduction to Entrepreneurship"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10"
                required
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide a brief description of this learning path..."
                rows={4}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10 resize-none"
                disabled={loading}
              />
            </div>

            {/* Audience */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                Target Audience
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {(["STUDENTS", "MENTORS", "EVERYONE"] as const).map((audience) => (
                  <button
                    key={audience}
                    type="button"
                    onClick={() => setFormData({ ...formData, audience })}
                    disabled={loading}
                    className={`flex cursor-pointer flex-col items-center gap-1.5 sm:gap-2 rounded-lg border-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all disabled:opacity-50 ${
                      formData.audience === audience
                        ? "border-[#111827] bg-[#111827] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <Users size={16} className="sm:w-5 sm:h-5" />
                    <span className="text-center break-words">{audience}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                Status
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {(["DRAFT", "ACTIVE"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({ ...formData, status })}
                    disabled={loading}
                    className={`flex cursor-pointer items-center gap-2 sm:gap-3 rounded-lg border-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all disabled:opacity-50 ${
                      formData.status === status
                        ? "border-[#111827] bg-[#111827] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {status === "DRAFT" ? (
                      <FileX size={16} className="sm:w-5 sm:h-5" />
                    ) : (
                      <FileCheck size={16} className="sm:w-5 sm:h-5" />
                    )}
                    <div className="text-left">
                      <div className="font-semibold">{status}</div>
                      <div className="text-[10px] sm:text-xs opacity-75">
                        {status === "DRAFT" ? "Not visible to students" : "Published and visible"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Core Path */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <input
                  type="checkbox"
                  id="isCore"
                  checked={formData.isCore}
                  onChange={(e) => setFormData({ ...formData, isCore: e.target.checked })}
                  disabled={loading}
                  className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-[#111827] focus:ring-2 focus:ring-[#111827]/20 disabled:opacity-50"
                />
                <div className="flex-1">
                  <label htmlFor="isCore" className="block cursor-pointer text-xs sm:text-sm font-semibold text-slate-900">
                    Mark as Core Learning Path
                  </label>
                  <p className="mt-1 text-[10px] sm:text-xs text-slate-600">
                    Core paths are mandatory for all students and must be completed before accessing other content.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 sm:mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto cursor-pointer rounded-lg border border-slate-300 bg-white px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="w-full sm:w-auto cursor-pointer rounded-lg bg-[#111827] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1f2937] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
