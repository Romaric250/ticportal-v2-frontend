"use client";

import { useState, useRef } from "react";
import { X, Image as ImageIcon, FileText, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { feedService, type CreatePostPayload, type FeedCategory, type FeedAttachment } from "@/src/lib/services/feedService";
import { apiClient } from "@/src/lib/api-client";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
  defaultCategory?: FeedCategory;
  isStudent?: boolean;
}

export function CreatePostModal({ isOpen, onClose, onPostCreated, defaultCategory, isStudent = false }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<FeedCategory>(defaultCategory || "GENERAL");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageAttachments, setImageAttachments] = useState<FeedAttachment[]>([]);
  const [attachments, setAttachments] = useState<FeedAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    
    if (imageFiles.length === 0) {
      toast.error("Please select image files");
      return;
    }

    // Check file sizes
    const oversizedFiles = imageFiles.filter((file) => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("Some images exceed 10MB limit");
      return;
    }

    // Limit to 10 images
    const filesToUpload = imageFiles.slice(0, 10);
    if (imageFiles.length > 10) {
      toast.info("Only the first 10 images will be uploaded");
    }

    try {
      setUploading(true);
      const uploadPromises = filesToUpload.map(async (file) => {
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

        const response = await apiClient.post<{ url: string }>(
          "/f/upload",
          {
            file: base64Data,
            fileName: file.name,
          }
        );

        return {
          fileName: file.name,
          fileUrl: response.data.url,
          fileSize: file.size,
          mimeType: file.type,
          fileType: "image" as const,
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setImageAttachments((prev) => [...prev, ...uploadedImages]);
      toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload images");
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
      // Convert to base64 as per existing upload pattern
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

      const response = await apiClient.post<{ url: string }>(
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

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Please enter post content");
      return;
    }

    try {
      setSubmitting(true);
      // Extract image URLs from image attachments
      const imageUrls = imageAttachments.map((img) => img.fileUrl);
      
      // Non-image attachments only
      const allAttachments = attachments;
      
      const payload: CreatePostPayload = {
        content: content.trim(),
        category,
        tags: tags.length > 0 ? tags : undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        attachments: allAttachments.length > 0 ? allAttachments : undefined,
      };

      if (title.trim()) {
        payload.title = title.trim();
      }

      await feedService.createPost(payload);
      toast.success("Post created successfully");
      
      // Reset form
      setContent("");
      setTitle("");
      setCategory(defaultCategory || "GENERAL");
      setTags([]);
      setImageAttachments([]);
      setAttachments([]);
      
      onPostCreated();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  const categories: { value: FeedCategory; label: string }[] = isStudent
    ? [{ value: "GENERAL", label: "General" }]
    : [
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-lg sm:rounded-xl border border-slate-200 bg-white shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Create Post</h2>
            <button
              onClick={onClose}
              disabled={submitting}
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-5">
            {/* Category */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedCategory)}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10 disabled:opacity-50"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title (Optional) */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                Title <span className="text-slate-400 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title..."
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10 disabled:opacity-50"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={6}
                required
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10 resize-none disabled:opacity-50"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                Tags <span className="text-slate-400 text-xs">(Optional, max 5)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-[#111827] px-2 sm:px-3 py-1 text-xs text-white"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={submitting}
                      className="hover:text-red-200 disabled:opacity-50"
                    >
                      <XCircle size={12} />
                    </button>
                  </span>
                ))}
              </div>
              {tags.length < 5 && (
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
                    disabled={submitting}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 text-sm focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={submitting || !tagInput.trim()}
                    className="rounded-lg bg-slate-100 px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Images Preview */}
            {imageAttachments.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                  Images ({imageAttachments.length})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* Show all image attachments */}
                  {imageAttachments.map((img, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={img.fileUrl}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageAttachments((prev) => prev.filter((_, i) => i !== index));
                        }}
                        disabled={submitting}
                        className="absolute top-1 right-1 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 disabled:opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Non-Image Attachments */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                  Attachments ({attachments.length})
                </label>
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 sm:gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2 sm:p-3"
                  >
                    <FileText size={18} className="sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                        {attachment.fileName}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500">
                        {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                      disabled={submitting}
                      className="text-red-500 hover:text-red-600 disabled:opacity-50"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading || submitting}
                className="hidden"
                multiple
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || submitting}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ImageIcon size={16} />
                )}
                <span>Add Image</span>
              </button>

              <input
                ref={attachmentInputRef}
                type="file"
                onChange={handleAttachmentUpload}
                disabled={uploading || submitting}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => attachmentInputRef.current?.click()}
                disabled={uploading || submitting}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <FileText size={16} />
                )}
                <span>Add File</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 sm:mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="w-full sm:w-auto cursor-pointer rounded-lg border border-slate-300 bg-white px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !content.trim() || uploading}
              className="w-full sm:w-auto cursor-pointer rounded-lg bg-[#111827] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1f2937] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                "Create Post"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
