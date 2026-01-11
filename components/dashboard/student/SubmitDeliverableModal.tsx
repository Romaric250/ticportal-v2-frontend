"use client";

import { useState } from "react";
import { X, Upload, FileText, Link as LinkIcon, Type } from "lucide-react";
import { type TeamDeliverable } from "../../../../src/lib/services/teamService";

interface SubmitDeliverableModalProps {
  deliverable: TeamDeliverable;
  isUpdate: boolean;
  onClose: () => void;
  onSubmit: (data: { content: string; contentType: "FILE" | "URL" | "TEXT"; description?: string; file?: File }) => Promise<void>;
  loading: boolean;
}

export function SubmitDeliverableModal({
  deliverable,
  isUpdate,
  onClose,
  onSubmit,
  loading,
}: SubmitDeliverableModalProps) {
  const [formData, setFormData] = useState({
    content: deliverable.content || "",
    description: deliverable.description || "",
  });
  const [file, setFile] = useState<File | null>(null);
  const contentType = deliverable.template.contentType;

  const handleSubmit = async () => {
    try {
      if (contentType === "FILE" && !file && !formData.content) {
        throw new Error("Please select a file to upload");
      }

      if (contentType === "TEXT" && !formData.content.trim()) {
        throw new Error("Text content is required");
      }

      if (contentType === "URL" && !formData.content.trim()) {
        throw new Error("URL is required");
      }

      await onSubmit({
        content: formData.content,
        contentType,
        description: formData.description || undefined,
        file: contentType === "FILE" ? file || undefined : undefined,
      });
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">
            {isUpdate ? "Update" : "Submit"}: {deliverable.template.title}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs font-medium text-blue-800 mb-1">Content Type: {contentType}</p>
            <p className="text-sm text-blue-700">{deliverable.template.description}</p>
          </div>

          {contentType === "FILE" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload File
              </label>
              <input
                type="file"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    setFile(selectedFile);
                    // For file uploads, we'll need to handle this differently
                    // The parent should handle the actual file upload
                  }
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">
                Note: File will be uploaded when you submit
              </p>
            </div>
          )}

          {contentType === "URL" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                External URL
              </label>
              <div className="relative">
                <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
                />
              </div>
            </div>
          )}

          {contentType === "TEXT" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Text Content
              </label>
              <div className="relative">
                <Type size={16} className="absolute left-3 top-3 text-slate-400" />
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  placeholder="Enter your content here..."
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Add any additional notes..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
            />
          </div>

          {deliverable.template.dueDate && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-medium text-amber-800">
                Due Date: {new Date(deliverable.template.dueDate).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || (contentType === "FILE" ? !file && !formData.content : !formData.content.trim())}
              className="cursor-pointer rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {isUpdate ? "Updating..." : "Submitting..."}
                </>
              ) : (
                <>
                  <Upload size={14} />
                  {isUpdate ? "Update" : "Submit"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

