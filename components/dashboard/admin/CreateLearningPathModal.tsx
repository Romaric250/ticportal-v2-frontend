"use client";

import { useState } from "react";
import { X, GraduationCap, Users, BookOpen } from "lucide-react";

interface CreateLearningPathModalProps {
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    audience: "STUDENTS" | "MENTORS" | "EVERYONE";
    isCore: boolean;
  }) => void;
  loading: boolean;
}

export function CreateLearningPathModal({ onClose, onSubmit, loading }: CreateLearningPathModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    audience: "STUDENTS" as "STUDENTS" | "MENTORS" | "EVERYONE",
    isCore: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#111827] p-2">
                <BookOpen size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Create Learning Path</h2>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Introduction to Entrepreneurship"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide a brief description of this learning path..."
                rows={4}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10 resize-none"
              />
            </div>

            {/* Audience */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Target Audience
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["STUDENTS", "MENTORS", "EVERYONE"] as const).map((audience) => (
                  <button
                    key={audience}
                    type="button"
                    onClick={() => setFormData({ ...formData, audience })}
                    className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                      formData.audience === audience
                        ? "border-[#111827] bg-[#111827] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <Users size={20} />
                    <span>{audience}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Core Path */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="isCore"
                  checked={formData.isCore}
                  onChange={(e) => setFormData({ ...formData, isCore: e.target.checked })}
                  className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-[#111827] focus:ring-2 focus:ring-[#111827]/20"
                />
                <div className="flex-1">
                  <label htmlFor="isCore" className="block cursor-pointer text-sm font-semibold text-slate-900">
                    Mark as Core Learning Path
                  </label>
                  <p className="mt-1 text-xs text-slate-600">
                    Core paths are mandatory for all students and must be completed before accessing other content.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="cursor-pointer rounded-lg bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1f2937] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Learning Path"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

