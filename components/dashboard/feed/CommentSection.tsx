"use client";

import { useState, useEffect, useRef } from "react";
import { Send, ThumbsUp, Reply, MoreVertical, Edit, Trash2, Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { feedService, type FeedComment } from "@/src/lib/services/feedService";
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
// Using regular img tag for external images
import { useSocketEvent } from "@/src/lib/socket";

interface CommentSectionProps {
  postId: string;
  currentUserId?: string;
  currentUserRole?: "ADMIN" | "MENTOR" | "STUDENT";
  onCommentAdded?: () => void;
  onCommentDeleted?: () => void;
}

export function CommentSection({
  postId,
  currentUserId,
  currentUserRole,
  onCommentAdded,
  onCommentDeleted,
}: CommentSectionProps) {
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showMenu, setShowMenu] = useState<Record<string, boolean>>({});
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const isAdmin = currentUserRole === "ADMIN";

  // Load comments
  useEffect(() => {
    loadComments();
  }, [postId]);

  // Listen for real-time comment updates
  useSocketEvent("feed:comment:created", (data: any) => {
    if (data.postId === postId) {
      console.log("CommentSection: Received feed:comment:created event", data);
      setComments((prev) => {
        // Check if comment already exists
        if (prev.some((c) => c.id === data.comment?.id)) {
          return prev;
        }
        // Add new comment or reply
        if (data.comment?.parentId) {
          return prev.map((comment) =>
            comment.id === data.comment.parentId
              ? { ...comment, replies: [...(comment.replies || []), data.comment] }
              : comment
          );
        }
        return [data.comment, ...prev];
      });
      onCommentAdded?.();
    }
  });

  useSocketEvent("feed:comment:updated", (data: any) => {
    if (data.postId === postId) {
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === data.commentId) {
            return { ...comment, content: data.content, updatedAt: data.updatedAt };
          }
          // Check replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === data.commentId
                  ? { ...reply, content: data.content, updatedAt: data.updatedAt }
                  : reply
              ),
            };
          }
          return comment;
        })
      );
    }
  });

  useSocketEvent("feed:comment:deleted", (data: any) => {
    if (data.postId === postId) {
      setComments((prev) => {
        // Remove comment or reply
        const filtered = prev.filter((comment) => comment.id !== data.commentId);
        // Also check replies
        return filtered.map((comment) => ({
          ...comment,
          replies: comment.replies?.filter((reply) => reply.id !== data.commentId),
        }));
      });
      onCommentDeleted?.();
    }
  });

  useSocketEvent("feed:comment:liked", (data: any) => {
    if (data.postId === postId) {
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === data.commentId) {
            return {
              ...comment,
              isLiked: data.isLiked,
              likesCount: data.likesCount,
            };
          }
          // Check replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === data.commentId
                  ? {
                      ...reply,
                      isLiked: data.isLiked,
                      likesCount: data.likesCount,
                    }
                  : reply
              ),
            };
          }
          return comment;
        })
      );
    }
  });

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await feedService.getComments(postId, { limit: 50 });
      // API returns: { success: true, data: { comments: [...], pagination: {...} } }
      // apiClient interceptor unwraps to: { comments: [...], pagination: {...} }
      // But getComments returns PaginationResponse<FeedComment> which is { data: [...], pagination: {...} }
      // So we need to check both structures
      let commentsData: FeedComment[] = [];
      if (Array.isArray(response)) {
        commentsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        commentsData = response.data;
      } else if (response?.comments && Array.isArray(response.comments)) {
        commentsData = response.comments;
      }
      setComments(commentsData);
    } catch (error: any) {
      console.error("Failed to load comments:", error);
      toast.error(error?.response?.data?.message || "Failed to load comments");
      setComments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || submitting) return;

    try {
      setSubmitting(true);
      await feedService.createComment(postId, {
        content: commentContent.trim(),
        parentId: replyingTo || null,
      });
      setCommentContent("");
      setReplyingTo(null);
      // Don't reload - socket event will handle the update
      onCommentAdded?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    const content = replyContent[parentId]?.trim();
    if (!content || submitting) return;

    try {
      setSubmitting(true);
      await feedService.createComment(postId, {
        content,
        parentId,
      });
      setReplyContent((prev) => ({ ...prev, [parentId]: "" }));
      // Don't reload - socket event will handle the update
      onCommentAdded?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim() || submitting) return;

    try {
      setSubmitting(true);
      await feedService.updateComment(commentId, editContent.trim());
      setEditingId(null);
      setEditContent("");
      // Don't reload - socket event will handle the update
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await feedService.deleteComment(commentId);
      // Don't reload - socket event will handle the update
      onCommentDeleted?.();
      setShowMenu((prev) => ({ ...prev, [commentId]: false }));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete comment");
    }
  };

  const handleLike = async (commentId: string, currentLiked: boolean, currentCount: number) => {
    // Optimistic update
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !currentLiked,
            likesCount: currentLiked ? currentCount - 1 : currentCount + 1,
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === commentId
                ? {
                    ...reply,
                    isLiked: !currentLiked,
                    likesCount: currentLiked ? currentCount - 1 : currentCount + 1,
                  }
                : reply
            ),
          };
        }
        return comment;
      })
    );

    try {
      const result = await feedService.likeComment(commentId);
      // Update with server response
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              isLiked: result.isLiked,
              likesCount: result.likesCount,
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === commentId
                  ? {
                      ...reply,
                      isLiked: result.isLiked,
                      likesCount: result.likesCount,
                    }
                  : reply
              ),
            };
          }
          return comment;
        })
      );
    } catch (error: any) {
      // Revert on error
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              isLiked: currentLiked,
              likesCount: currentCount,
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === commentId
                  ? {
                      ...reply,
                      isLiked: currentLiked,
                      likesCount: currentCount,
                    }
                  : reply
              ),
            };
          }
          return comment;
        })
      );
      toast.error(error?.response?.data?.message || "Failed to like comment");
    }
  };

  const handleTyping = (value: string) => {
    setCommentContent(value);
    if (!typing) {
      setTyping(true);
      // Emit typing indicator via socket (if implemented)
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 3000);
  };

  const formatTime = formatTimeAgo;

  const renderComment = (comment: FeedComment, isReply = false) => {
    const isAuthor = currentUserId === comment.author.id;
    const canEdit = isAuthor;
    const canDelete = isAuthor || isAdmin;

    return (
      <div key={comment.id} className={isReply ? "ml-4 sm:ml-6 mt-3" : ""}>
        <div className="flex gap-2 sm:gap-3">
          <div className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 rounded-full bg-slate-200 overflow-hidden">
            {comment.author.avatarUrl ? (
              <img
                src={comment.author.avatarUrl}
                alt={comment.author.fullName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <p className="text-xs sm:text-sm font-semibold text-slate-900">
                {comment.author.fullName}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500">
                {formatTime(comment.createdAt)}
              </p>
              {comment.updatedAt !== comment.createdAt && (
                <p className="text-[10px] sm:text-xs text-slate-400">(edited)</p>
              )}
            </div>

            {editingId === comment.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827] resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(comment.id)}
                    disabled={submitting || !editContent.trim()}
                    className="rounded-lg bg-[#111827] px-3 py-1 text-xs text-white hover:bg-[#1f2937] disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditContent("");
                    }}
                    className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
                <div className="mt-1.5 sm:mt-2 flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => handleLike(comment.id, comment.isLiked, comment.likesCount)}
                    className={`cursor-pointer inline-flex items-center gap-1 text-[10px] sm:text-xs transition-colors ${
                      comment.isLiked
                        ? "text-[#111827] font-semibold"
                        : "text-slate-500 hover:text-[#111827]"
                    }`}
                  >
                    <ThumbsUp
                      size={12}
                      className={comment.isLiked ? "fill-current" : ""}
                    />
                    <span>{comment.likesCount}</span>
                  </button>
                  {!isReply && (
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="cursor-pointer text-[10px] sm:text-xs text-slate-500 hover:text-[#111827]"
                    >
                      Reply
                    </button>
                  )}
                  {(canEdit || canDelete) && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowMenu((prev) => ({
                            ...prev,
                            [comment.id]: !prev[comment.id],
                          }))
                        }
                        className="cursor-pointer text-[10px] sm:text-xs text-slate-500 hover:text-[#111827]"
                      >
                        <MoreVertical size={12} />
                      </button>
                      {showMenu[comment.id] && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() =>
                              setShowMenu((prev) => ({ ...prev, [comment.id]: false }))
                            }
                          />
                          <div className="absolute left-0 top-6 z-20 w-32 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
                            {canEdit && (
                              <button
                                onClick={() => {
                                  setEditingId(comment.id);
                                  setEditContent(comment.content);
                                  setShowMenu((prev) => ({ ...prev, [comment.id]: false }));
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                              >
                                <Edit size={12} />
                                Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(comment.id)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Reply Input */}
            {replyingTo === comment.id && (
              <div className="mt-3 flex items-center gap-2">
                <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-200 flex-shrink-0" />
                <input
                  type="text"
                  value={replyContent[comment.id] || ""}
                  onChange={(e) =>
                    setReplyContent((prev) => ({ ...prev, [comment.id]: e.target.value }))
                  }
                  placeholder="Write a reply..."
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-1 focus:ring-[#111827] min-w-0"
                />
                <button
                  onClick={() => handleReply(comment.id)}
                  disabled={submitting || !replyContent[comment.id]?.trim()}
                  className="cursor-pointer rounded-lg bg-[#111827] p-1.5 sm:p-2 text-white hover:bg-[#1f2937] flex-shrink-0 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>
            )}

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {comment.replies.map((reply) => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 size={20} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t border-slate-100 pt-3 sm:pt-4">
      {/* Comments List */}
      {comments && comments.length > 0 ? (
        <div className="space-y-4">{comments.map((comment) => renderComment(comment))}</div>
      ) : (
        <p className="text-xs sm:text-sm text-slate-500 text-center py-4">
          No comments yet. Be the first to comment!
        </p>
      )}

      {/* Comment Input */}
      {currentUserId && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-200 flex-shrink-0" />
          <input
            type="text"
            value={commentContent}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-1 focus:ring-[#111827] min-w-0"
          />
          <button
            type="submit"
            disabled={submitting || !commentContent.trim()}
            className="cursor-pointer rounded-lg bg-[#111827] p-1.5 sm:p-2 text-white hover:bg-[#1f2937] flex-shrink-0 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </form>
      )}
    </div>
  );
}
