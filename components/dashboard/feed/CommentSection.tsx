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
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const isAdmin = currentUserRole === "ADMIN";

  // Load comments when component mounts or postId changes
  useEffect(() => {
    console.log("CommentSection: useEffect triggered, loading comments", { postId });
    loadComments();
  }, [postId]);

  // Listen for real-time comment updates
  useSocketEvent("feed:comment:created", (data: any) => {
    console.log("CommentSection: Received feed:comment:created event", { data, postId, currentPostId: postId });
    if (data.postId === postId) {
      console.log("CommentSection: Processing feed:comment:created event for current post", data);
      // Extract comment from data - handle both structures
      const comment = data.comment || data;
      console.log("CommentSection: Extracted comment from socket event:", comment);
      
      setComments((prev) => {
        if (!comment || !comment.id) {
          console.warn("CommentSection: Invalid comment data in socket event", { data, comment });
          return prev;
        }
        
        // Check if comment already exists (check both top-level and nested)
        const commentExists = prev.some((c) => 
          c.id === comment.id || 
          (c.replies && c.replies.some((r) => r.id === comment.id))
        );
        if (commentExists) {
          console.log("CommentSection: Comment already exists, skipping", comment.id);
          return prev;
        }
        
        // Add new comment or reply
        if (comment.parentId) {
          // This is a reply - need to find parent in top-level or nested replies
          console.log("CommentSection: Adding reply to parent comment", comment.parentId);
          return prev.map((c) => {
            // Check if this is the direct parent
            if (c.id === comment.parentId) {
              const newReplies = [...(c.replies || []), comment];
              // Sort replies by createdAt ascending (oldest first)
              newReplies.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateA - dateB;
              });
              return { ...c, replies: newReplies };
            }
            // Check if parent is in nested replies
            if (c.replies && c.replies.some((r) => r.id === comment.parentId)) {
              return {
                ...c,
                replies: c.replies.map((r) => {
                  if (r.id === comment.parentId) {
                    const newNestedReplies = [...(r.replies || []), comment];
                    // Sort nested replies by createdAt ascending (oldest first)
                    newNestedReplies.sort((a, b) => {
                      const dateA = new Date(a.createdAt).getTime();
                      const dateB = new Date(b.createdAt).getTime();
                      return dateA - dateB;
                    });
                    return { ...r, replies: newNestedReplies };
                  }
                  return r;
                }),
              };
            }
            return c;
          });
        }
        // This is a top-level comment - add to end (oldest first order)
        console.log("CommentSection: Adding new top-level comment", comment.id);
        const newComments = [...prev, comment];
        // Sort by createdAt ascending (oldest first)
        newComments.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateA - dateB;
        });
        console.log("CommentSection: Updated comments count:", newComments.length);
        return newComments;
      });
      // Clear the input if this is the current user's comment
      const commentAuthorId = comment?.authorId || comment?.author?.id || data.comment?.authorId || data.authorId || data.comment?.author?.id;
      if (commentAuthorId === currentUserId) {
        setCommentContent("");
        setReplyingTo(null);
        // Also clear any reply inputs
        setReplyContent({});
      }
      onCommentAdded?.();
    } else {
      console.log("CommentSection: Ignoring feed:comment:created event for different post", { eventPostId: data.postId, currentPostId: postId });
    }
  });

  useSocketEvent("feed:comment:updated", (data: any) => {
    console.log("CommentSection: Received feed:comment:updated event", { data, postId });
    if (data.postId === postId) {
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === data.commentId) {
            return { ...comment, content: data.content, isEdited: true, updatedAt: data.updatedAt || new Date().toISOString() };
          }
          // Check replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) => {
                if (reply.id === data.commentId) {
                  return { ...reply, content: data.content, isEdited: true, updatedAt: data.updatedAt || new Date().toISOString() };
                }
                // Check nested replies (replies to replies)
                if (reply.replies) {
                  return {
                    ...reply,
                    replies: reply.replies.map((nestedReply) =>
                      nestedReply.id === data.commentId
                        ? { ...nestedReply, content: data.content, isEdited: true, updatedAt: data.updatedAt || new Date().toISOString() }
                        : nestedReply
                    ),
                  };
                }
                return reply;
              }),
            };
          }
          return comment;
        })
      );
      // Close edit mode if this comment was being edited
      if (editingId === data.commentId) {
        setEditingId(null);
        setEditContent("");
      }
    }
  });

  useSocketEvent("feed:comment:deleted", (data: any) => {
    console.log("CommentSection: Received feed:comment:deleted event", { data, postId });
    if (data.postId === postId) {
      setComments((prev) => {
        // Remove comment or reply (check top-level, replies, and nested replies)
        return prev
          .filter((comment) => comment.id !== data.commentId)
          .map((comment) => ({
            ...comment,
            replies: comment.replies
              ?.filter((reply) => reply.id !== data.commentId)
              .map((reply) => ({
                ...reply,
                replies: reply.replies?.filter((nestedReply) => nestedReply.id !== data.commentId),
              })),
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
      console.log("CommentSection: Loading comments for postId:", postId);
      // Reset comments before loading to ensure fresh data
      setComments([]);
      const response = await feedService.getComments(postId, { limit: 50 });
      console.log("CommentSection: Raw response from getComments:", response);
      console.log("CommentSection: Response type:", typeof response);
      console.log("CommentSection: Is array?", Array.isArray(response));
      console.log("CommentSection: Response keys:", response ? Object.keys(response) : "null/undefined");
      console.log("CommentSection: Full response structure:", JSON.stringify(response, null, 2));
      
      // getComments returns PaginationResponse<FeedComment> which is { data: FeedComment[], pagination: {...} }
      // The apiClient interceptor unwraps { success: true, data: {...} } to just {...}
      // But the API might return { comments: [...], pagination: {...} } or { data: [...], pagination: {...} }
      let commentsData: FeedComment[] = [];
      
      if (Array.isArray(response)) {
        console.log("CommentSection: Response is array, length:", response.length);
        commentsData = response;
      } else if (response && typeof response === "object") {
        // Check for comments property first (API might use this)
        if (Array.isArray((response as any).comments)) {
          console.log("CommentSection: Found comments in response.comments, length:", (response as any).comments.length);
          commentsData = (response as any).comments;
        } else if (Array.isArray(response.data)) {
          console.log("CommentSection: Found comments in response.data, length:", response.data.length);
          commentsData = response.data;
        } else {
          console.warn("CommentSection: Unexpected response structure:", {
            hasData: !!response.data,
            hasComments: !!(response as any).comments,
            dataType: typeof response.data,
            commentsType: typeof (response as any).comments,
            isDataArray: Array.isArray(response.data),
            isCommentsArray: Array.isArray((response as any).comments),
            responseKeys: Object.keys(response),
            fullResponse: response,
          });
        }
      } else {
        console.error("CommentSection: Invalid response type:", typeof response, response);
      }
      
      console.log("CommentSection: Final commentsData length:", commentsData.length);
      console.log("CommentSection: Comments data:", commentsData);
      // Sort comments by createdAt ascending (oldest first)
      const sortedComments = [...commentsData].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB;
      });
      // Also sort replies within each comment
      sortedComments.forEach((comment) => {
        if (comment.replies && comment.replies.length > 0) {
          comment.replies.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateA - dateB;
          });
        }
      });
      setComments(sortedComments);
    } catch (error: any) {
      console.error("CommentSection: Failed to load comments:", error);
      console.error("CommentSection: Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        stack: error?.stack,
      });
      toast.error(error?.response?.data?.message || error?.message || "Failed to load comments");
      setComments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || submitting) return;

    const contentToSubmit = commentContent.trim();
    const parentIdToSubmit = replyingTo || null;

    // Clear input immediately for better UX
    setCommentContent("");
    const previousReplyingTo = replyingTo;
    setReplyingTo(null);

    try {
      setSubmitting(true);
      const newComment = await feedService.createComment(postId, {
        content: contentToSubmit,
        parentId: parentIdToSubmit,
      });
      
      // Optimistic update - add comment immediately if socket event doesn't fire quickly
      // Socket event will handle the real update, but this ensures immediate feedback
      setTimeout(() => {
        setComments((prev) => {
          // Check if comment already exists (socket event might have added it)
          const exists = prev.some((c) => 
            c.id === newComment.id || 
            (c.replies && c.replies.some((r) => r.id === newComment.id))
          );
          if (exists) return prev;
          
          // Add the comment
          if (newComment.parentId) {
            return prev.map((c) => {
              if (c.id === newComment.parentId) {
                const newReplies = [...(c.replies || []), newComment];
                newReplies.sort((a, b) => {
                  const dateA = new Date(a.createdAt).getTime();
                  const dateB = new Date(b.createdAt).getTime();
                  return dateA - dateB;
                });
                return { ...c, replies: newReplies };
              }
              if (c.replies && c.replies.some((r) => r.id === newComment.parentId)) {
                return {
                  ...c,
                  replies: c.replies.map((r) => {
                    if (r.id === newComment.parentId) {
                      const newNestedReplies = [...(r.replies || []), newComment];
                      newNestedReplies.sort((a, b) => {
                        const dateA = new Date(a.createdAt).getTime();
                        const dateB = new Date(b.createdAt).getTime();
                        return dateA - dateB;
                      });
                      return { ...r, replies: newNestedReplies };
                    }
                    return r;
                  }),
                };
              }
              return c;
            });
          }
          // Add to end and sort (oldest first)
          const newComments = [...prev, newComment];
          newComments.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateA - dateB;
          });
          return newComments;
        });
      }, 500); // Wait 500ms for socket event, then add optimistically
      
      onCommentAdded?.();
    } catch (error: any) {
      // Restore input on error
      setCommentContent(contentToSubmit);
      if (parentIdToSubmit) {
        setReplyingTo(parentIdToSubmit);
      }
      toast.error(error?.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    const content = replyContent[parentId]?.trim();
    if (!content || submitting) return;

    // Clear input immediately for better UX
    const previousContent = content;
    setReplyContent((prev) => ({ ...prev, [parentId]: "" }));
    // Also clear replyingTo if this was the active reply
    const wasReplyingTo = replyingTo === parentId;
    if (wasReplyingTo) {
      setReplyingTo(null);
    }

    try {
      setSubmitting(true);
      const newReply = await feedService.createComment(postId, {
        content,
        parentId,
      });
      
      // Optimistic update - add reply immediately if socket event doesn't fire quickly
      setTimeout(() => {
        setComments((prev) => {
          // Check if reply already exists (socket event might have added it)
          const exists = prev.some((c) => 
            (c.replies && c.replies.some((r) => r.id === newReply.id)) ||
            (c.replies && c.replies.some((r) => r.replies && r.replies.some((nr) => nr.id === newReply.id)))
          );
          if (exists) return prev;
          
          // Add the reply
          return prev.map((c) => {
            if (c.id === parentId) {
              const newReplies = [...(c.replies || []), newReply];
              newReplies.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateA - dateB;
              });
              return { ...c, replies: newReplies };
            }
            if (c.replies && c.replies.some((r) => r.id === parentId)) {
              return {
                ...c,
                replies: c.replies.map((r) => {
                  if (r.id === parentId) {
                    const newNestedReplies = [...(r.replies || []), newReply];
                    newNestedReplies.sort((a, b) => {
                      const dateA = new Date(a.createdAt).getTime();
                      const dateB = new Date(b.createdAt).getTime();
                      return dateA - dateB;
                    });
                    return { ...r, replies: newNestedReplies };
                  }
                  return r;
                }),
              };
            }
            return c;
          });
        });
      }, 500); // Wait 500ms for socket event, then add optimistically
      
      onCommentAdded?.();
    } catch (error: any) {
      // Restore input on error
      setReplyContent((prev) => ({ ...prev, [parentId]: previousContent }));
      if (wasReplyingTo) {
        setReplyingTo(parentId);
      }
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
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="cursor-pointer text-[10px] sm:text-xs text-slate-500 hover:text-[#111827]"
                  >
                    Reply
                  </button>
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleReply(comment.id);
                }}
                className="mt-3 flex items-center gap-2"
              >
                <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-200 flex-shrink-0" />
                <input
                  type="text"
                  value={replyContent[comment.id] || ""}
                  onChange={(e) =>
                    setReplyContent((prev) => ({ ...prev, [comment.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (replyContent[comment.id]?.trim() && !submitting) {
                        handleReply(comment.id);
                      }
                    }
                  }}
                  placeholder="Write a reply..."
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-1 focus:ring-[#111827] min-w-0"
                />
                <button
                  type="submit"
                  disabled={submitting || !replyContent[comment.id]?.trim()}
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

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {comment.replies.map((reply) => {
                  // Also show reply input for nested replies
                  return (
                    <div key={reply.id}>
                      {renderComment(reply, true)}
                      {/* Reply Input for nested replies */}
                      {replyingTo === reply.id && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleReply(reply.id);
                          }}
                          className="mt-3 ml-4 sm:ml-6 flex items-center gap-2"
                        >
                          <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-200 flex-shrink-0" />
                          <input
                            type="text"
                            value={replyContent[reply.id] || ""}
                            onChange={(e) =>
                              setReplyContent((prev) => ({ ...prev, [reply.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                if (replyContent[reply.id]?.trim() && !submitting) {
                                  handleReply(reply.id);
                                }
                              }
                            }}
                            placeholder="Write a reply..."
                            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-1 focus:ring-[#111827] min-w-0"
                          />
                          <button
                            type="submit"
                            disabled={submitting || !replyContent[reply.id]?.trim()}
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
                })}
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

  console.log("CommentSection: Rendering with comments:", { 
    commentsCount: comments?.length || 0, 
    loading, 
    postId,
    comments: comments 
  });

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
