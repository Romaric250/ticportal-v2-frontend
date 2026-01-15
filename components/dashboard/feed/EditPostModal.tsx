"use client";

import { useState, useRef, useEffect } from "react";
import { X, Image as ImageIcon, FileText, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { feedService, type UpdatePostPayload, type FeedCategory, type FeedAttachment, type FeedPost } from "@/src/lib/services/feedService";
import { apiClient } from "@/src/lib/api-client";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated: () => void;
  post: FeedPost;
}

export function EditPostModal({ isOpen, onClose, onPostUpdated, post }: EditPostModalProps) {
  const [content, setContent] = useState(post.content);
  const [title, setTitle] = useState(post.title || "");
  const [category, setCategory] = useState<FeedCategory>(post.category);
  const [tags, setTags] = useState<string[]>(post.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(post.imageUrl);
  const [attachments, setAttachments] = useState<FeedAttachment[]>(post.attachments || []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // Reset form when post changes
  useEffect(() => {
    if (isOpen && post) {
      setContent(post.content);
      setTitle(post.title || "");
      setCategory(post.category);
      setTags(post.tags || []);
      setImageUrl(post.imageUrl);
      setAttachments(post.attachments || []);
    }
  }, [isOpen, post]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    try {
      setUploading(true);
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to convert file to base64"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await apiClient.post<{ success: true; data: { url: string } }>(
        "/f/upload",
        {
          file: base64Data,
          fileName: file.name,
        }
      );

      setImageUrl(response.data.url);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    try {
      setUploading(true);
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to convert file to base64"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await apiClient.post<{ success: true; data: { url: string } }>(
        "/f/upload",
        {
          file: base64Data,
          fileName: file.name,
        }
      );

      const newAttachment: FeedAttachment = {
        fileName: file.name,
        fileUrl: response.data.url,
        fileSize: file.size,
        mimeType: file.type,
        fileType: file.type.startsWith("video/") ? "video" : "document",
      };

      setAttachments((prev) => [...prev, newAttachment]);
      toast.success("File uploaded successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
      if (attachmentInputRef.current) attachmentInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Please enter post content");
      return;
    }

    try {
      setSubmitting(true);
      const payload: UpdatePostPayload = {
        title: title.trim() || null,
        content: content.trim(),
        category,
        tags: tags.length > 0 ? tags : undefined,
        imageUrl: imageUrl || null,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      await feedService.updatePost(post.id, payload);
      toast.success("Post updated successfully");
      onPostUpdated();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update post");
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions: { value: FeedCategory; label: string }[] = [
    { value: "ANNOUNCEMENTS", label: "Official Announcements" },
    { value: "MENTORSHIP", label: "Mentorship" },
    { value: "TEAM_UPDATES", label: "Team Updates" },
    { value: "ACHIEVEMENTS", label: "Achievements" },
    { value: "EVENTS", label: "Events" },
    { value: "LEARNING", label: "Learning" },
    { value: "TECH_NEWS", label: "Tech News" },
    { value: "OPPORTUNITIES", label: "Opportunities" },
    { value: "GENERAL", label: "General" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 py-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Edit Post</h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Category */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FeedCategory)}
              className="w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/20"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              className="w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/20"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={6}
              required
              className="w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium text-slate-700"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="cursor-pointer hover:text-red-600"
                  >
                    <XCircle size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add a tag..."
                className="flex-1 rounded-lg border border-slate-300 px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/20"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Add
              </button>
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
              Image
            </label>
            {imageUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-200">
                <img
                  src={imageUrl}
                  alt="Post image"
                  className="w-full h-auto max-h-64 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 cursor-pointer rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700"
                >
                  <XCircle size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full rounded-lg border-2 border-dashed border-slate-300 p-4 sm:p-6 text-center hover:border-[#111827] hover:bg-slate-50 transition disabled:opacity-50"
              >
                <ImageIcon size={24} className="mx-auto mb-2 text-slate-400" />
                <p className="text-xs sm:text-sm font-medium text-slate-600">
                  {uploading ? "Uploading..." : "Click to upload image"}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Max 10MB</p>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
              Attachments
            </label>
            {attachments.length > 0 && (
              <div className="space-y-2 mb-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2 sm:p-3"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <FileText size={16} className="text-slate-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                          {attachment.fileName}
                        </p>
                        <p className="text-[10px] sm:text-xs text-slate-500">
                          {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="cursor-pointer rounded-lg p-1 text-red-600 hover:bg-red-50 flex-shrink-0"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => attachmentInputRef.current?.click()}
              disabled={uploading}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FileText size={16} />
              {uploading ? "Uploading..." : "Add Attachment"}
            </button>
            <input
              ref={attachmentInputRef}
              type="file"
              onChange={handleAttachmentUpload}
              className="hidden"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 sm:flex-initial rounded-lg border border-slate-300 bg-white px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="flex-1 sm:flex-initial rounded-lg bg-[#111827] px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                "Update Post"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
