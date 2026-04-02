"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Upload, FileText, Link as LinkIcon, Type, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { type TeamDeliverable } from "@/src/lib/services/teamService";
import { isGoogleDriveUrl, checkGDriveAccess } from "@/src/lib/gdrive-check";
import { toast } from "sonner";

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
  const reviewStatus = deliverable.reviewStatus || deliverable.status || "PENDING";
  const isResubmit = reviewStatus === "REJECTED" && isUpdate;
  const [formData, setFormData] = useState({
    content: deliverable.content || "",
    description: deliverable.description || "",
  });
  const [file, setFile] = useState<File | null>(null);
  const contentType = deliverable.template.contentType;

  // GDrive access check state
  const [urlAccessStatus, setUrlAccessStatus] = useState<"idle" | "checking" | "accessible" | "not-accessible" | "error">("idle");
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const runAccessCheck = useCallback(async (url: string) => {
    if (!url.trim() || !isGoogleDriveUrl(url)) {
      setUrlAccessStatus("idle");
      return;
    }
    setUrlAccessStatus("checking");
    const result = await checkGDriveAccess(url);
    if (result.accessible === true) {
      setUrlAccessStatus("accessible");
    } else if (result.accessible === false) {
      setUrlAccessStatus("not-accessible");
    } else {
      setUrlAccessStatus("error");
    }
  }, []);

  const handleUrlChange = useCallback((url: string) => {
    setFormData((prev) => ({ ...prev, content: url }));
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    if (isGoogleDriveUrl(url)) {
      setUrlAccessStatus("checking");
      checkTimeoutRef.current = setTimeout(() => runAccessCheck(url), 800);
    } else {
      setUrlAccessStatus("idle");
    }
  }, [runAccessCheck]);

  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, []);

  // Run initial check if content already has a GDrive URL
  useEffect(() => {
    if (contentType === "URL" && formData.content && isGoogleDriveUrl(formData.content)) {
      runAccessCheck(formData.content);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    try {
      if (contentType === "FILE" && !file && !formData.content) {
        toast.error("Please select a file to upload");
        return;
      }
      if (contentType === "TEXT" && !formData.content.trim()) {
        toast.error("Text content is required");
        return;
      }
      if (contentType === "URL" && !formData.content.trim()) {
        toast.error("URL is required");
        return;
      }

      if (contentType === "URL" && urlAccessStatus === "not-accessible") {
        toast.error("Your Google Drive link is not publicly accessible. Please update the sharing settings to \"Anyone with the link\" before submitting.");
        return;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 sm:px-6 py-4 sm:py-5 bg-slate-50/80 shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate min-w-0">
            {isResubmit ? "Resubmit" : (isUpdate ? "Update" : "Submit")}: {deliverable.template.title}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-5 overflow-y-auto flex-1 min-h-0">
          <div className="rounded-xl border border-blue-200/80 bg-blue-50/80 p-4 overflow-y-auto max-h-[120px]">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-800 mb-1.5">Content Type: {contentType}</p>
            {deliverable.template.description && (
              <p className="text-sm text-blue-700/90 leading-relaxed">{deliverable.template.description}</p>
            )}
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
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none"
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
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com"
                  className={`w-full rounded-lg border bg-white pl-10 pr-10 py-2.5 text-sm transition-colors focus:ring-2 focus:outline-none ${
                    urlAccessStatus === "not-accessible"
                      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                      : urlAccessStatus === "accessible"
                        ? "border-green-400 focus:border-green-500 focus:ring-green-200"
                        : "border-slate-300 focus:border-slate-900 focus:ring-slate-900/20"
                  }`}
                />
                {urlAccessStatus === "checking" && (
                  <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" />
                )}
                {urlAccessStatus === "accessible" && (
                  <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                )}
                {urlAccessStatus === "not-accessible" && (
                  <XCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                )}
                {urlAccessStatus === "error" && (
                  <AlertTriangle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500" />
                )}
              </div>
              {urlAccessStatus === "checking" && (
                <p className="mt-1.5 text-xs text-blue-600">Verifying link access...</p>
              )}
              {urlAccessStatus === "accessible" && (
                <p className="mt-1.5 text-xs text-green-600">Link is publicly accessible</p>
              )}
              {urlAccessStatus === "not-accessible" && (
                <p className="mt-1.5 text-xs text-red-600">
                  This Google Drive link is not publicly accessible. Please open the file/folder in Google Drive, click &quot;Share&quot;, and set access to &quot;Anyone with the link&quot;.
                </p>
              )}
              {urlAccessStatus === "error" && (
                <p className="mt-1.5 text-xs text-amber-600">Could not verify link access. You can still submit.</p>
              )}
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
                  rows={4}
                  placeholder="Enter your content here..."
                  className="w-full min-h-[100px] max-h-[200px] rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2.5 text-sm transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none resize-y"
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
              rows={2}
              placeholder="Add any additional notes..."
              className="w-full min-h-[60px] max-h-[120px] rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:outline-none resize-y"
            />
          </div>

          {deliverable.template.dueDate && (
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-4">
              <p className="text-xs font-semibold text-amber-800">
                Due Date: {new Date(deliverable.template.dueDate).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 border-t border-slate-100 shrink-0">
            <button
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || (contentType === "FILE" ? !file && !formData.content : !formData.content.trim())}
              className="cursor-pointer rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {isResubmit ? "Resubmitting..." : (isUpdate ? "Updating..." : "Submitting...")}
                </>
              ) : (
                <>
                  <Upload size={14} />
                  {isResubmit ? "Resubmit" : (isUpdate ? "Update" : "Submit")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

