"use client";

import { useState, useEffect } from "react";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Eye,
  Bookmark,
  MoreVertical,
  Pin,
  Flag,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { feedService, type FeedPost, type FeedAuthor } from "@/src/lib/services/feedService";
import { DeleteConfirmationModal } from "@/components/dashboard/admin/DeleteConfirmationModal";
import { EditPostModal } from "./EditPostModal";
import { ImageCarousel } from "./ImageCarousel";
import { useSocketEvent } from "@/src/lib/socket";
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
// Using regular img tag for external images to avoid Next.js image configuration issues
import { CommentSection } from "./CommentSection";

interface FeedPostCardProps {
  post: FeedPost;
  currentUserId?: string;
  currentUserRole?: "ADMIN" | "MENTOR" | "STUDENT";
  onUpdate?: () => void;
  onDelete?: (postId: string) => void;
}

export function FeedPostCard({
  post,
  currentUserId,
  currentUserRole,
  onUpdate,
  onDelete,
}: FeedPostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked ?? false);
  const [viewsCount, setViewsCount] = useState(post.viewsCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [liking, setLiking] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageCarousel, setShowImageCarousel] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [expandedContent, setExpandedContent] = useState(false);

  const isAuthor = currentUserId === post.author.id;
  const isAdmin = currentUserRole === "ADMIN";
  const canEdit = isAuthor || isAdmin;
  const canDelete = isAuthor || isAdmin;

  // Collect all images for carousel
  const allImages: string[] = [];
  // Use imageUrls array from post
  if (post.imageUrls && post.imageUrls.length > 0) {
    allImages.push(...post.imageUrls);
  }
  // Also include image attachments if any
  if (post.attachments) {
    const imageAttachments = post.attachments
      .filter((att) => att.fileType === "image" || att.mimeType?.startsWith("image/"))
      .map((att) => att.fileUrl);
    allImages.push(...imageAttachments);
  }
  const hasMultipleImages = allImages.length > 1;
  
  // Content truncation
  const MAX_CONTENT_LENGTH = 200;
  const shouldTruncate = post.content.length > MAX_CONTENT_LENGTH;
  const displayContent = expandedContent || !shouldTruncate 
    ? post.content 
    : post.content.substring(0, MAX_CONTENT_LENGTH) + "...";

  // Real-time: Post liked
  useSocketEvent("feed:post:liked", (data: any) => {
    if (data.postId === post.id) {
      console.log("FeedPostCard: Received feed:post:liked event", data);
      setIsLiked(data.isLiked);
      setLikesCount(data.likesCount);
    }
  });

  // Real-time: Comment created (update comment count)
  useSocketEvent("feed:comment:created", (data: any) => {
    if (data.postId === post.id) {
      console.log("FeedPostCard: Received feed:comment:created event", data);
      setCommentsCount(data.commentsCount);
    }
  });

  // Real-time: Comment deleted (update comment count)
  useSocketEvent("feed:comment:deleted", (data: any) => {
    if (data.postId === post.id) {
      console.log("FeedPostCard: Received feed:comment:deleted event", data);
      setCommentsCount(data.commentsCount);
    }
  });

  // Track view once when post is visible
  useEffect(() => {
    if (!viewTracked && currentUserId) {
      const timer = setTimeout(() => {
        handleView();
      }, 2000); // Track view after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [viewTracked, currentUserId]);

  const handleLike = async () => {
    if (liking) return;

    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    try {
      setLiking(true);
      const result = await feedService.likePost(post.id);
      setIsLiked(result.isLiked);
      setLikesCount(result.likesCount);
    } catch (error: any) {
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikesCount((prev) => (newIsLiked ? prev - 1 : prev + 1));
      toast.error(error?.response?.data?.message || "Failed to like post");
    } finally {
      setLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (bookmarking) return;

    // Optimistic update
    const newIsBookmarked = !isBookmarked;
    setIsBookmarked(newIsBookmarked);

    try {
      setBookmarking(true);
      const result = await feedService.bookmarkPost(post.id);
      setIsBookmarked(result.isBookmarked);
      if (result.isBookmarked) {
        toast.success("Post bookmarked");
      } else {
        toast.info("Post unbookmarked");
      }
    } catch (error: any) {
      // Revert on error
      setIsBookmarked(!newIsBookmarked);
      toast.error(error?.response?.data?.message || "Failed to bookmark post");
    } finally {
      setBookmarking(false);
    }
  };

  const handleView = async () => {
    if (viewing || viewTracked || !currentUserId) return;

    try {
      setViewing(true);
      const result = await feedService.viewPost(post.id);
      setViewsCount(result.viewsCount);
      setViewTracked(true);
    } catch (error) {
      // Silent fail for views
    } finally {
      setViewing(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || "TIC Feed Post",
          text: post.content,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleReport = async () => {
    try {
      await feedService.reportContent({
        postId: post.id,
        reason: "OTHER",
        description: "Inappropriate content",
      });
      toast.success("Post reported. Thank you for your feedback.");
      setShowMenu(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to report post");
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await feedService.deletePost(post.id);
      toast.success("Post deleted successfully");
      onDelete?.(post.id);
      setShowDeleteModal(false);
      setShowMenu(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
    setShowMenu(false);
  };

  const handleImageClick = (index: number) => {
    setCarouselIndex(index);
    setShowImageCarousel(true);
  };

  const formatTime = formatTimeAgo;

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ANNOUNCEMENTS: "Announcements",
      MENTORSHIP: "Mentorship",
      TEAM_UPDATES: "Team Updates",
      ACHIEVEMENTS: "Achievements",
      EVENTS: "Events",
      LEARNING: "Learning",
      TECH_NEWS: "Tech News",
      OPPORTUNITIES: "Opportunities",
      GENERAL: "General",
    };
    return labels[category] || category;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      {/* Author Header */}
      <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
          {post.author.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={post.author.fullName}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback to initials if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  const initials = post.author.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  if (!parent.textContent) {
                    parent.textContent = initials;
                    parent.className += " text-xs sm:text-sm font-semibold text-slate-600";
                  }
                }
              }}
            />
          ) : (
            <span className="text-xs sm:text-sm font-semibold text-slate-600">
              {post.author.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
              {post.author.fullName}
            </p>
            <span className="rounded-full bg-[#111827] px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-white flex-shrink-0">
              {post.author.role}
            </span>
            {post.isPinned && (
              <Pin size={12} className="text-amber-500 flex-shrink-0" />
            )}
            {post.isOfficial && (
              <span className="rounded-full bg-blue-100 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-blue-700 flex-shrink-0">
                Official
              </span>
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 truncate">
            {formatTime(post.createdAt)} • {getCategoryLabel(post.category)}
          </p>
        </div>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <MoreVertical size={16} />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-48 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
                {canEdit && (
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => {
                      setShowDeleteModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                )}
                {!isAuthor && (
                  <button
                    onClick={handleReport}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Flag size={14} />
                    Report
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      {post.title && (
        <div className="mb-2 sm:mb-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">{post.title}</h3>
        </div>
      )}

      {/* Content */}
      <div className="mb-3 sm:mb-4">
        <p className="text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-wrap break-words">
          {displayContent}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setExpandedContent(!expandedContent)}
            className="mt-1 text-xs sm:text-sm font-semibold text-[#111827] hover:underline"
          >
            {expandedContent ? "See less" : "See more"}
          </button>
        )}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mb-3 sm:mb-4 flex flex-wrap gap-2">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-slate-100 px-2 sm:px-3 py-0.5 text-[10px] sm:text-xs font-medium text-slate-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Images - LinkedIn/Instagram style layout */}
      {allImages.length > 0 && (
        <div className="mb-3 sm:mb-4 rounded-xl overflow-hidden">
          {hasMultipleImages ? (
            <div className="flex gap-2">
              {/* Main image on left */}
              <div
                className="flex-1 relative cursor-pointer group"
                onClick={() => handleImageClick(0)}
              >
                <img
                  src={allImages[0]}
                  alt="Post image"
                  className="w-full h-full min-h-[300px] sm:min-h-[400px] object-cover rounded-l-lg"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-l-lg" />
              </div>
              
              {/* Thumbnails on right */}
              <div className="flex flex-col gap-2 w-24 sm:w-32">
                {allImages.slice(1, 4).map((img, index) => (
                  <div
                    key={index + 1}
                    className="relative flex-1 cursor-pointer group overflow-hidden rounded-r-lg"
                    onClick={() => handleImageClick(index + 1)}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 2}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    {index === 2 && allImages.length > 4 && (
                      <div
                        className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(0);
                        }}
                      >
                        <span className="text-white text-xs sm:text-sm font-semibold">
                          +{allImages.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {/* If only 2 images, show second one full height */}
                {allImages.length === 2 && (
                  <div
                    className="relative flex-1 cursor-pointer group overflow-hidden rounded-r-lg"
                    onClick={() => handleImageClick(1)}
                  >
                    <img
                      src={allImages[1]}
                      alt="Thumbnail 2"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Single image
            <div
              className="relative cursor-pointer group"
              onClick={() => handleImageClick(0)}
            >
              <img
                src={allImages[0]}
                alt="Post image"
                className="w-full h-auto max-h-[400px] sm:max-h-[500px] object-contain bg-slate-50 rounded-lg"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg" />
            </div>
          )}
        </div>
      )}

      {/* Video */}
      {post.videoUrl && (
        <div className="mb-3 sm:mb-4 rounded-xl overflow-hidden">
          <video
            src={post.videoUrl}
            controls
            className="w-full max-h-96"
          />
        </div>
      )}

      {/* Non-image Attachments */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="mb-3 sm:mb-4 space-y-2">
          {post.attachments
            .filter(
              (att) => att.fileType !== "image" && !att.mimeType?.startsWith("image/")
            )
            .map((attachment, index) => (
              <a
                key={attachment.id || index}
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 sm:gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2 sm:p-3 hover:bg-slate-100 transition-colors"
              >
                <div className="flex-shrink-0">
                  {attachment.fileType === "video" ? (
                    <div className="h-10 w-10 rounded bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 text-xs">VID</span>
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 text-xs">DOC</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                    {attachment.fileName}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500">
                    {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </a>
            ))}
        </div>
      )}

      {/* Engagement */}
      <div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-2 sm:gap-4 border-t border-slate-100 pt-3 sm:pt-4">
        <button
          onClick={handleLike}
          disabled={liking}
          className={`cursor-pointer inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm transition-colors disabled:opacity-50 ${
            isLiked ? "text-[#111827] font-semibold" : "text-slate-600 hover:text-[#111827]"
          }`}
        >
          {liking ? (
            <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" />
          ) : (
            <ThumbsUp size={14} className={`sm:w-4 sm:h-4 ${isLiked ? "fill-current" : ""}`} />
          )}
          <span>{likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="cursor-pointer inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 hover:text-[#111827]"
        >
          <MessageCircle size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{commentsCount} Comments</span>
          <span className="sm:hidden">{commentsCount}</span>
        </button>

        <div className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600">
          <Eye size={14} className="sm:w-4 sm:h-4" />
          <span>{viewsCount}</span>
        </div>

        <button
          onClick={handleBookmark}
          disabled={bookmarking}
          className={`cursor-pointer inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm transition-colors disabled:opacity-50 ${
            isBookmarked ? "text-[#111827] font-semibold" : "text-slate-600 hover:text-[#111827]"
          }`}
        >
          {bookmarking ? (
            <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" />
          ) : (
            <Bookmark
              size={14}
              className={`sm:w-4 sm:h-4 ${isBookmarked ? "fill-current" : ""}`}
            />
          )}
          <span className="hidden sm:inline">Save</span>
        </button>

        <button
          onClick={handleShare}
          className="cursor-pointer inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 hover:text-[#111827]"
        >
          <Share2 size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div id={`comments-${post.id}`} className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
          <CommentSection
            postId={post.id}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            onCommentAdded={() => {
              setCommentsCount((prev) => prev + 1);
              onUpdate?.();
            }}
            onCommentDeleted={() => {
              setCommentsCount((prev) => Math.max(0, prev - 1));
              onUpdate?.();
            }}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        itemName={post.title || post.content.substring(0, 50)}
        loading={deleting}
      />

      {/* Edit Post Modal */}
      {showEditModal && (
        <EditPostModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onPostUpdated={() => {
            onUpdate?.();
            setShowEditModal(false);
          }}
          post={post}
        />
      )}

      {/* Image Carousel */}
      {allImages.length > 0 && (
        <ImageCarousel
          images={allImages}
          isOpen={showImageCarousel}
          onClose={() => setShowImageCarousel(false)}
          initialIndex={carouselIndex}
        />
      )}
    </div>
  );
}
