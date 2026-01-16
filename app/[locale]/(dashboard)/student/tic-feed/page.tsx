"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useAuthStore } from "@/src/state/auth-store";
import { connectSocket, getSocket, useSocketEvent } from "@/src/lib/socket";
import { feedService, type FeedPost, type FeedCategory } from "@/src/lib/services/feedService";
import { FeedPostCard } from "@/components/dashboard/feed/FeedPostCard";
import { CreatePostModal } from "@/components/dashboard/feed/CreatePostModal";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import {
  Pin,
  Calendar,
  ArrowRight,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";

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

// Component to track post views using Intersection Observer
function PostWithViewTracking({
  post,
  currentUserId,
  currentUserRole,
  onUpdate,
  onDelete,
  viewedPostsRef,
  viewStartTimesRef,
}: {
  post: FeedPost;
  currentUserId?: string;
  currentUserRole: "ADMIN" | "MENTOR" | "STUDENT";
  onUpdate?: () => void;
  onDelete?: (postId: string) => void;
  viewedPostsRef: React.MutableRefObject<Set<string>>;
  viewStartTimesRef: React.MutableRefObject<Map<string, number>>;
}) {
  const postRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Don't track views for own posts
    if (post.author.id === currentUserId) {
      return;
    }

    // Don't track if already viewed
    if (viewedPostsRef.current.has(post.id)) {
      return;
    }

    const element = postRef.current;
    if (!element) return;

    // Create Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Post is visible - start tracking view time
            viewStartTimesRef.current.set(post.id, Date.now());
            
            // Track duration every 5 seconds
            durationIntervalRef.current = setInterval(() => {
              const startTime = viewStartTimesRef.current.get(post.id);
              if (startTime) {
                const duration = Math.floor((Date.now() - startTime) / 1000);
                // Record view with duration
                feedService.recordView(post.id, duration).catch((error) => {
                  console.error("Failed to record view:", error);
                });
              }
            }, 5000); // Record every 5 seconds
          } else {
            // Post is not visible - stop tracking and record final view
            const startTime = viewStartTimesRef.current.get(post.id);
            if (startTime) {
              const duration = Math.floor((Date.now() - startTime) / 1000);
              if (duration > 0) {
                // Record final view duration
                feedService.recordView(post.id, duration).catch((error) => {
                  console.error("Failed to record view:", error);
                });
              }
              viewStartTimesRef.current.delete(post.id);
            }
            
            // Clear interval
            if (durationIntervalRef.current) {
              clearInterval(durationIntervalRef.current);
              durationIntervalRef.current = null;
            }
            
            // Mark as viewed
            viewedPostsRef.current.add(post.id);
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of post is visible
        rootMargin: "0px",
      }
    );

    observerRef.current.observe(element);

    return () => {
      // Cleanup
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      // Record final view if still tracking
      const startTime = viewStartTimesRef.current.get(post.id);
      if (startTime) {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        if (duration > 0) {
          feedService.recordView(post.id, duration).catch((error) => {
            console.error("Failed to record view:", error);
          });
        }
        viewStartTimesRef.current.delete(post.id);
      }
    };
  }, [post.id, currentUserId, viewedPostsRef, viewStartTimesRef]);

  return (
    <div ref={postRef} id={`post-${post.id}`}>
      <FeedPostCard
        post={post}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  );
}

export default function TICFeedPage() {
  const { user, accessToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState<FeedCategory | "all">("all");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [pinnedPosts, setPinnedPosts] = useState<FeedPost[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<FeedPost[]>([]);
  const [latestPosts, setLatestPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FeedPost[]>([]);
  const socketRef = useRef<any>(null);
  const viewedPostsRef = useRef<Set<string>>(new Set());
  const viewStartTimesRef = useRef<Map<string, number>>(new Map());
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Determine if user is a student - use memoized value to prevent re-renders
  const isStudent = user?.role?.toLowerCase() === "student";

  // Map UI tabs to API categories
  const getCategoryForTab = (tab: string): FeedCategory | undefined => {
    if (tab === "all") return undefined;
    const categoryMap: Record<string, FeedCategory> = {
      announcements: "ANNOUNCEMENTS",
      mentorship: "MENTORSHIP",
      updates: "TEAM_UPDATES",
      achievements: "ACHIEVEMENTS",
      events: "EVENTS",
      learning: "LEARNING",
      tech_news: "TECH_NEWS",
      opportunities: "OPPORTUNITIES",
      general: "GENERAL",
    };
    return categoryMap[tab.toLowerCase()];
  };

  // All users can see all filter tabs
  // Use useMemo to ensure tabs don't disappear on re-render
  const tabs = useMemo(() => {
    return [
      { id: "all", label: "All Posts" },
      { id: "announcements", label: "Official Announcements" },
      { id: "mentorship", label: "Mentorship" },
      { id: "updates", label: "Team Updates" },
      { id: "achievements", label: "Achievements" },
      { id: "events", label: "Events" },
      { id: "learning", label: "Learning" },
      { id: "tech_news", label: "Tech News" },
      { id: "opportunities", label: "Opportunities" },
      { id: "general", label: "General" },
    ];
  }, []);

  // Initialize socket connection - ensure it stays connected
  useEffect(() => {
    if (accessToken) {
      console.log("Feed: Initializing socket connection with token");
      socketRef.current = connectSocket(accessToken);
      
      // Ensure socket stays connected
      const socket = socketRef.current;
      if (socket) {
        const handleConnect = () => {
          console.log("Feed: Socket connected successfully", { socketId: socket.id });
          const category = getCategoryForTab(activeTab);
          socket.emit("feed:join", {
            category: category || "all",
          });
          console.log("Feed: Joined feed room", { category: category || "all" });
        };

        const handleDisconnect = (reason: string) => {
          console.log("Feed: Socket disconnected", { reason });
          // Socket.IO will auto-reconnect
        };

        const handleError = (error: Error) => {
          console.error("Feed: Socket connection error", error);
        };

        if (socket.connected) {
          handleConnect();
        } else {
          socket.on("connect", handleConnect);
        }

        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleError);

        return () => {
          socket.off("connect", handleConnect);
          socket.off("disconnect", handleDisconnect);
          socket.off("connect_error", handleError);
          if (socket.connected) {
            socket.emit("feed:leave");
          }
        };
      }
    }
    return () => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("feed:leave");
      }
    };
  }, [accessToken]);

  // Join feed room when tab changes or socket connects
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleConnect = () => {
      const category = getCategoryForTab(activeTab);
      socket.emit("feed:join", {
        category: category || "all",
      });
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.once("connect", handleConnect);
    }

    return () => {
      if (socket?.connected) {
        socket.emit("feed:leave");
      }
    };
  }, [activeTab]);

  // Load posts - loads 2 posts at a time for smooth scrolling
  const loadPosts = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const currentPage = reset ? 1 : page;
      const category = getCategoryForTab(activeTab);

      const response = await feedService.getPosts({
        category: category || "all",
        page: currentPage,
        limit: 2, // Load 2 posts at a time for smooth infinite scroll
        includePinned: currentPage === 1,
      });

      if (reset) {
        setPosts(response.posts);
        setPinnedPosts(response.pinnedPosts || []);
      } else {
        setPosts((prev) => [...prev, ...response.posts]);
      }

      setHasMore(response.pagination.page < response.pagination.totalPages);
      setPage(currentPage + 1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load posts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Search posts
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchQuery("");
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await feedService.searchPosts({
        q: query.trim(),
        page: 1,
        limit: 20,
      });
      // API returns { posts: [...], pagination: {...}, query: "..." }
      setSearchResults(response.posts || []);
      setSearchQuery(query);
    } catch (error: any) {
      // Silent fail - don't show toast for search errors
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Load pinned posts
  const loadPinnedPosts = async () => {
    try {
      const pinned = await feedService.getPinnedPosts();
      setPinnedPosts(pinned);
    } catch (error) {
      // Silent fail for pinned posts
    }
  };

  // Load trending posts
  const loadTrendingPosts = async () => {
    try {
      const trending = await feedService.getTrendingPosts(3);
      setTrendingPosts(trending);
    } catch (error) {
      // Silent fail for trending posts
      console.error("Failed to load trending posts:", error);
    }
  };

  // Load latest posts
  const loadLatestPosts = async () => {
    try {
      const latest = await feedService.getLatestPosts(3);
      setLatestPosts(latest);
    } catch (error) {
      // Silent fail for latest posts
      console.error("Failed to load latest posts:", error);
    }
  };

  // Initial load
  useEffect(() => {
    if (!isSearching) {
      loadPosts(true);
      loadPinnedPosts();
      loadTrendingPosts();
      loadLatestPosts();
    }
  }, [activeTab]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (isSearching || !hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadPosts(false);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loadingMore, loading, isSearching]);

  // Real-time: New post created
  useSocketEvent("feed:post:created", (data: any) => {
    const category = getCategoryForTab(activeTab);
    // Only add if it matches current category or is "all"
    if (
      activeTab === "all" ||
      (category && data.post?.category === category)
    ) {
      setPosts((prev) => [data.post, ...prev]);
      toast.success("New post added!");
    }
  });

  // Real-time: Post updated
  useSocketEvent("feed:post:updated", (data: any) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === data.postId
          ? { ...post, ...data.updates }
          : post
      )
    );
  });

  // Real-time: Post deleted
  useSocketEvent("feed:post:deleted", (data: any) => {
    setPosts((prev) => prev.filter((post) => post.id !== data.postId));
    setPinnedPosts((prev) => prev.filter((post) => post.id !== data.postId));
  });

  // Real-time: Post pinned
  useSocketEvent("feed:post:pinned", (data: any) => {
    if (data.isPinned) {
      loadPinnedPosts();
    } else {
      setPinnedPosts((prev) => prev.filter((post) => post.id !== data.postId));
    }
    setPosts((prev) =>
      prev.map((post) =>
        post.id === data.postId ? { ...post, isPinned: data.isPinned } : post
      )
    );
  });

  // Real-time: Post liked
  useSocketEvent("feed:post:liked", (data: any) => {
    console.log("Feed: Received feed:post:liked event", data);
    setPosts((prev) =>
      prev.map((post) =>
        post.id === data.postId
          ? {
              ...post,
              likesCount: data.likesCount,
              isLiked: post.author.id === user?.id ? post.isLiked : data.isLiked,
            }
          : post
      )
    );
  });

  // Real-time: Comment created (update comment count)
  useSocketEvent("feed:comment:created", (data: any) => {
    console.log("Feed: Received feed:comment:created event", data);
    setPosts((prev) =>
      prev.map((post) =>
        post.id === data.postId
          ? { ...post, commentsCount: data.commentsCount }
          : post
      )
    );
  });

  // Real-time: Comment deleted (update comment count)
  useSocketEvent("feed:comment:deleted", (data: any) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === data.postId
          ? { ...post, commentsCount: data.commentsCount }
          : post
      )
    );
  });

  // Real-time: View incremented
  useSocketEvent("feed:view:incremented", (data: any) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === data.postId ? { ...post, viewsCount: data.viewsCount } : post
      )
    );
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts(true);
    await loadPinnedPosts();
    await loadTrendingPosts();
    await loadLatestPosts();
    setRefreshing(false);
    toast.success("Feed refreshed");
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadPosts(false);
    }
  };

  const handlePostCreated = () => {
    loadPosts(true);
    loadPinnedPosts();
    loadTrendingPosts();
    loadLatestPosts();
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
    setPinnedPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const mapUserRole = (role: string | null | undefined): "ADMIN" | "MENTOR" | "STUDENT" => {
    if (role === "admin" || role === "super-admin") return "ADMIN";
    if (role === "mentor") return "MENTOR";
    return "STUDENT";
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
      <div className="grid gap-3 sm:gap-4 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main Content */}
        <div className="space-y-3 sm:space-y-4 lg:space-y-6 min-w-0">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              {/* <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">TIC Feed</h1>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-600">
                Stay updated with summit news, official posts, and mentorship announcements.
              </p> */}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              {user && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="cursor-pointer rounded-lg bg-[#111827] px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#1f2937] flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Create Post</span>
                  <span className="sm:hidden">Post</span>
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                if (value.trim()) {
                  handleSearch(value);
                } else {
                  setIsSearching(false);
                  setSearchResults([]);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  handleSearch(searchQuery);
                }
              }}
              placeholder="Search posts..."
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setIsSearching(false);
                  setSearchResults([]);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        {tabs && tabs.length > 0 && (
          <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 overflow-x-auto scrollbar-hide -mx-2 sm:-mx-4 lg:mx-0 px-2 sm:px-4 lg:px-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FeedCategory | "all")}
                className={`cursor-pointer whitespace-nowrap px-2 sm:px-3 lg:px-4 py-2 text-[11px] sm:text-xs lg:text-sm font-semibold transition flex-shrink-0 ${
                  activeTab === tab.id
                    ? "border-b-2 border-[#111827] text-[#111827]"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Pinned Posts */}
        {pinnedPosts.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            {pinnedPosts.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                currentUserRole={mapUserRole(user?.role)}
                onUpdate={handlePostCreated}
                onDelete={handlePostDeleted}
              />
            ))}
          </div>
        )}

        {/* Search Results or Posts */}
        {isSearching ? (
          <>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={32} className="animate-spin text-slate-400" />
              </div>
            ) : (searchResults && searchResults.length > 0) ? (
              <div className="space-y-4 sm:space-y-6">
                {searchResults.map((post) => (
                  <PostWithViewTracking
                    key={post.id}
                    post={post}
                    currentUserId={user?.id}
                    currentUserRole={mapUserRole(user?.role)}
                    onUpdate={handlePostCreated}
                    onDelete={handlePostDeleted}
                    viewedPostsRef={viewedPostsRef}
                    viewStartTimesRef={viewStartTimesRef}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-slate-200 bg-white">
                <p className="text-sm sm:text-base font-medium text-slate-500">No posts found</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-400">
                  Try a different search term
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={32} className="animate-spin text-slate-400" />
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-slate-200 bg-white">
                <p className="text-sm sm:text-base font-medium text-slate-500">No posts yet</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-400">
                  {user ? "Be the first to create a post!" : "Please log in to view posts"}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 sm:space-y-6">
                  {posts.map((post) => (
                    <PostWithViewTracking
                      key={post.id}
                      post={post}
                      currentUserId={user?.id}
                      currentUserRole={mapUserRole(user?.role)}
                      onUpdate={handlePostCreated}
                      onDelete={handlePostDeleted}
                      viewedPostsRef={viewedPostsRef}
                      viewStartTimesRef={viewStartTimesRef}
                    />
                  ))}
                </div>

                {/* Infinite Scroll Trigger */}
                {hasMore && (
                  <div ref={loadMoreRef} className="flex justify-center pt-4">
                    {loadingMore ? (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-xs sm:text-sm">Loading more posts...</span>
                      </div>
                    ) : (
                      <div className="h-4" /> // Spacer for intersection observer
                    )}
                  </div>
                )}

                {!hasMore && posts.length > 0 && (
                  <div className="flex justify-center pt-4">
                    <p className="text-xs sm:text-sm text-slate-500">No more posts to load</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block sticky top-4 h-fit space-y-4 sm:space-y-6 order-first lg:order-last">
        {/* Pinned Section */}
        {pinnedPosts.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Pin size={18} className="text-[#111827]" />
              <h3 className="text-sm font-semibold text-slate-900">Pinned</h3>
            </div>
            <div className="space-y-3">
              {pinnedPosts.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-3 transition hover:bg-slate-100"
                  onClick={() => {
                    // Scroll to post
                    const element = document.getElementById(`post-${post.id}`);
                    element?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2">
                    {post.title || post.content.substring(0, 50)}...
                  </p>
                  <p className="mt-1 text-[10px] sm:text-xs text-slate-500">
                    {post.author.fullName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Posts Section */}
        {trendingPosts.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-[#111827]" />
              <h3 className="text-sm font-semibold text-slate-900">Trending</h3>
            </div>
            <div className="space-y-3">
              {trendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-3 transition hover:bg-slate-100"
                  onClick={() => {
                    // Scroll to post
                    const element = document.getElementById(`post-${post.id}`);
                    element?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2">
                    {post.title || post.content.substring(0, 50)}...
                  </p>
                  <p className="mt-1 text-[10px] sm:text-xs text-slate-500">
                    {post.author.fullName} • {formatTimeAgo(post.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Latest Posts Section */}
        {latestPosts.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ArrowRight size={18} className="text-[#111827]" />
              <h3 className="text-sm font-semibold text-slate-900">Latest Posts</h3>
            </div>
            <div className="space-y-3">
              {latestPosts.map((post) => (
                <div
                  key={post.id}
                  className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-3 transition hover:bg-slate-100"
                  onClick={() => {
                    // Scroll to post
                    const element = document.getElementById(`post-${post.id}`);
                    element?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2">
                    {post.title || post.content.substring(0, 50)}...
                  </p>
                  <p className="mt-1 text-[10px] sm:text-xs text-slate-500">
                    {post.author.fullName} • {formatTimeAgo(post.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && user && (
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
          defaultCategory={isStudent ? "GENERAL" : undefined}
          isStudent={isStudent}
        />
      )}
    </div>
  );
}
