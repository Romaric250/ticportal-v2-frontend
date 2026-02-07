"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/src/state/auth-store";
import { connectSocket, useSocketEvent } from "@/src/lib/socket";
import { feedService, type FeedPost } from "@/src/lib/services/feedService";
import { FeedPostCard } from "@/components/dashboard/feed/FeedPostCard";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Affiliate sees TIC Feed (read-only): like, comment, view. No create/edit/delete.
export default function AffiliateTicFeedPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const seenPostIdsRef = useRef<string[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadPosts = async (reset = false) => {
    if (reset) {
      seenPostIdsRef.current = [];
    }
    const nextPage = reset ? 1 : pagination.page + 1;
    const seenPostIds = seenPostIdsRef.current;
    const excludePostIds = seenPostIds.length > 0 ? seenPostIds.join(",") : undefined;

    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await feedService.getPosts({
        page: nextPage,
        limit: 10,
        category: "all",
        includePinned: true,
        excludePostIds,
      });
      const newPosts = response.posts || [];
      const returnedIds = response.returnedPostIds || newPosts.map((p) => p.id);
      returnedIds.forEach((id) => {
        if (!seenPostIdsRef.current.includes(id)) seenPostIdsRef.current.push(id);
      });

      if (reset) {
        setPosts(newPosts);
        setPagination((p) => ({
          ...p,
          page: 1,
          total: response.pagination?.total ?? 0,
          totalPages: response.pagination?.totalPages ?? 0,
        }));
      } else {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const added = newPosts.filter((p) => !existingIds.has(p.id));
          return [...prev, ...added];
        });
        setPagination((p) => ({
          ...p,
          page: nextPage,
          total: response.pagination?.total ?? p.total,
          totalPages: response.pagination?.totalPages ?? p.totalPages,
        }));
      }
      setHasMore(nextPage < (response.pagination?.totalPages ?? 1));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    connectSocket();
  }, []);

  useEffect(() => {
    loadPosts(true);
  }, []);

  useEffect(() => {
    if (!hasMore || loadingMore || loading) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) loadPosts(false);
      },
      { threshold: 0.1, rootMargin: "100px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading]);

  useSocketEvent("feed:post:liked", (data: any) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === data.postId
          ? {
              ...post,
              likesCount: typeof data.likesCount === "number" ? data.likesCount : post.likesCount,
              isLiked: typeof data.isLiked === "boolean" ? data.isLiked : post.isLiked,
            }
          : post
      )
    );
  });
  useSocketEvent("feed:comment:created", (data: any) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === data.postId ? { ...post, commentsCount: data.commentsCount } : post
      )
    );
  });
  useSocketEvent("feed:comment:deleted", (data: any) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === data.postId ? { ...post, commentsCount: data.commentsCount } : post
      )
    );
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts(true);
    setRefreshing(false);
    toast.success("Feed refreshed");
  };

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-bold text-slate-900 sm:text-xl lg:text-2xl">
          TIC Feed
        </h1>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:text-sm"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-slate-400" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-500">
          No posts yet.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <FeedPostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              currentUserRole="STUDENT"
              onUpdate={() => loadPosts(true)}
              onDelete={() => setPosts((prev) => prev.filter((p) => p.id !== post.id))}
            />
          ))}
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {loadingMore && <Loader2 size={24} className="animate-spin text-slate-400" />}
          </div>
        </div>
      )}
    </div>
  );
}
