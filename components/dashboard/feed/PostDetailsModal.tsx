"use client";

import { X, ThumbsUp, MessageCircle, Eye, Bookmark, Share2, Calendar, User, Tag } from "lucide-react";
import { FeedPost } from "@/src/lib/services/feedService";
import { ImageCarousel } from "./ImageCarousel";

// Date formatting helper
const formatTimeAgo = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  } catch {
    return dateString;
  }
};

interface PostDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: FeedPost;
  onLike?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export function PostDetailsModal({
  isOpen,
  onClose,
  post,
  onLike,
  onBookmark,
  onShare,
  isLiked = false,
  isBookmarked = false,
}: PostDetailsModalProps) {
  if (!isOpen) return null;

  // Collect all images
  const allImages: string[] = [];
  if (post.imageUrls && post.imageUrls.length > 0) {
    allImages.push(...post.imageUrls);
  }
  if (post.attachments) {
    const imageAttachments = post.attachments
      .filter((att) => att.fileType === "image" || att.mimeType?.startsWith("image/"))
      .map((att) => att.fileUrl)
      .filter((url) => !allImages.includes(url));
    allImages.push(...imageAttachments);
  }

  const categoryLabels: Record<string, string> = {
    ANNOUNCEMENTS: "Official Announcements",
    MENTORSHIP: "Mentorship",
    TEAM_UPDATES: "Team Updates",
    ACHIEVEMENTS: "Achievements",
    EVENTS: "Events",
    LEARNING: "Learning",
    TECH_NEWS: "Tech News",
    OPPORTUNITIES: "Opportunities",
    GENERAL: "General",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Post Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Author Info */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
              {post.author.avatarUrl ? (
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-600 text-xs sm:text-sm font-semibold">
                  {post.author.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                  {post.author.fullName}
                </p>
                {post.isOfficial && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-semibold">
                    Official
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                <span>{formatTimeAgo(post.createdAt)}</span>
                <span>•</span>
                <span className="capitalize">{post.author.role.toLowerCase()}</span>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-slate-400" />
            <span className="text-xs sm:text-sm font-medium text-slate-600">
              {categoryLabels[post.category] || post.category}
            </span>
          </div>

          {/* Title */}
          {post.title && (
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">{post.title}</h3>
          )}

          {/* Content */}
          <div className="text-sm sm:text-base text-slate-700 whitespace-pre-wrap break-words">
            {post.content}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Images */}
          {allImages.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allImages.slice(0, 6).map((img, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 cursor-pointer group"
                    onClick={() => {
                      // Open carousel at this index
                      const carousel = document.getElementById("image-carousel-modal");
                      if (carousel) {
                        // Trigger carousel open
                      }
                    }}
                  >
                    <img
                      src={img}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
              {allImages.length > 6 && (
                <p className="text-xs text-slate-500 text-center">
                  +{allImages.length - 6} more images
                </p>
              )}
            </div>
          )}

          {/* Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-700">Attachments</h4>
              <div className="space-y-2">
                {post.attachments
                  .filter((att) => att.fileType !== "image")
                  .map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 text-xs font-semibold">DOC</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {attachment.fileName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </a>
                  ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 sm:gap-6 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <ThumbsUp size={16} />
              <span className="font-semibold">{post.likesCount}</span>
              <span>likes</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <MessageCircle size={16} />
              <span className="font-semibold">{post.commentsCount}</span>
              <span>comments</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Eye size={16} />
              <span className="font-semibold">{post.viewsCount}</span>
              <span>views</span>
            </div>
            {post.bookmarksCount !== undefined && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Bookmark size={16} />
                <span className="font-semibold">{post.bookmarksCount}</span>
                <span>saved</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 sm:gap-4">
            {onLike && (
              <button
                onClick={onLike}
                className={`inline-flex items-center gap-2 text-sm transition-colors ${
                  isLiked ? "text-[#111827] font-semibold" : "text-slate-600 hover:text-[#111827]"
                }`}
              >
                <ThumbsUp size={18} className={isLiked ? "fill-current" : ""} />
                <span>Like</span>
              </button>
            )}
            {onBookmark && (
              <button
                onClick={onBookmark}
                className={`inline-flex items-center gap-2 text-sm transition-colors ${
                  isBookmarked ? "text-[#111827] font-semibold" : "text-slate-600 hover:text-[#111827]"
                }`}
              >
                <Bookmark size={18} className={isBookmarked ? "fill-current" : ""} />
                <span>Save</span>
              </button>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#111827] transition-colors"
              >
                <Share2 size={18} />
                <span>Share</span>
              </button>
            )}
          </div>
          <div className="text-xs text-slate-500">
            <Calendar size={14} className="inline mr-1" />
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
