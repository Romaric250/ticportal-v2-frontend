import { apiClient } from "../api-client";

export type FeedCategory =
  | "ANNOUNCEMENTS"
  | "MENTORSHIP"
  | "TEAM_UPDATES"
  | "ACHIEVEMENTS"
  | "EVENTS"
  | "LEARNING"
  | "TECH_NEWS"
  | "OPPORTUNITIES"
  | "GENERAL"
  | "all";

export type FeedVisibility =
  | "PUBLIC"
  | "STUDENTS_ONLY"
  | "MENTORS_ONLY"
  | "TEAM_ONLY"
  | "ADMIN_ONLY";

export type ReportReason =
  | "SPAM"
  | "INAPPROPRIATE"
  | "HARASSMENT"
  | "FALSE_INFORMATION"
  | "OTHER";

export interface FeedAttachment {
  id?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  fileType?: "image" | "video" | "document";
}

export interface FeedAuthor {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "MENTOR" | "STUDENT";
  avatarUrl: string | null;
}

export interface FeedPost {
  id: string;
  author: FeedAuthor;
  title: string | null;
  content: string;
  category: FeedCategory;
  tags?: string[];
  imageUrls: string[];
  videoUrl: string | null;
  attachments: FeedAttachment[];
  visibility: FeedVisibility;
  teamId?: string | null;
  isPinned: boolean;
  isOfficial: boolean;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  bookmarksCount?: number;
  isLiked: boolean;
  isBookmarked?: boolean;
  createdAt: string;
  updatedAt: string;
  pinnedAt?: string | null;
}

export interface FeedComment {
  id: string;
  author: FeedAuthor;
  content: string;
  parentId: string | null;
  replies?: FeedComment[];
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostPayload {
  title?: string | null;
  content: string;
  category: FeedCategory;
  tags?: string[];
  imageUrls?: string[];
  videoUrl?: string | null;
  visibility?: FeedVisibility;
  teamId?: string | null;
  attachments?: FeedAttachment[];
  isOfficial?: boolean;
}

export interface UpdatePostPayload extends Partial<CreatePostPayload> {}

export interface CreateCommentPayload {
  content: string;
  parentId?: string | null;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FeedPostsResponse {
  posts: FeedPost[];
  pinnedPosts?: FeedPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const feedService = {
  /**
   * Get paginated feed posts
   */
  async getPosts(params: {
    category?: FeedCategory | "all";
    visibility?: FeedVisibility;
    page?: number;
    limit?: number;
    includePinned?: boolean;
    teamId?: string;
    authorId?: string;
    tags?: string[];
    search?: string;
  }): Promise<FeedPostsResponse> {
    // The apiClient interceptor unwraps { success: true, data: {...} } to just {...}
    const { data } = await apiClient.get<FeedPostsResponse>(
      "/feed/posts",
      { params }
    );
    return data;
  },

  /**
   * Get single post by ID
   */
  async getPostById(postId: string): Promise<FeedPost> {
    const { data } = await apiClient.get<FeedPost>(
      `/feed/posts/${postId}`
    );
    return data;
  },

  /**
   * Create a new post
   */
  async createPost(payload: CreatePostPayload): Promise<FeedPost> {
    const { data } = await apiClient.post<FeedPost>(
      "/feed/posts",
      payload
    );
    return data;
  },

  /**
   * Update a post
   */
  async updatePost(postId: string, payload: UpdatePostPayload): Promise<FeedPost> {
    const { data } = await apiClient.put<FeedPost>(
      `/feed/posts/${postId}`,
      payload
    );
    return data;
  },

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<void> {
    await apiClient.delete(`/feed/posts/${postId}`);
  },

  /**
   * Pin/unpin a post (admin only)
   */
  async pinPost(postId: string, isPinned: boolean): Promise<FeedPost> {
    const { data } = await apiClient.post<FeedPost>(
      `/feed/posts/${postId}/pin`,
      { isPinned }
    );
    return data;
  },

  /**
   * Like/unlike a post
   */
  async likePost(postId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    const { data } = await apiClient.post<{ isLiked: boolean; likesCount: number }>(
      `/feed/posts/${postId}/like`
    );
    return data;
  },

  /**
   * Get users who liked a post
   */
  async getPostLikes(
    postId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginationResponse<FeedAuthor & { likedAt: string }>> {
    const { data } = await apiClient.get<PaginationResponse<FeedAuthor & { likedAt: string }>>(
      `/feed/posts/${postId}/likes`,
      { params }
    );
    return data;
  },

  /**
   * Record a post view
   */
  async viewPost(postId: string, duration?: number): Promise<{ viewsCount: number }> {
    const { data } = await apiClient.post<{ viewsCount: number }>(
      `/feed/posts/${postId}/view`,
      { duration }
    );
    return data;
  },

  /**
   * Record a post view (new endpoint)
   */
  async recordView(postId: string, duration: number): Promise<{ viewsCount: number }> {
    const { data } = await apiClient.post<{ viewsCount: number }>(
      `/feed/posts/${postId}/record-view`,
      { duration }
    );
    return data;
  },

  /**
   * Bookmark/unbookmark a post
   */
  async bookmarkPost(postId: string): Promise<{ isBookmarked: boolean }> {
    const { data } = await apiClient.post<{ isBookmarked: boolean }>(
      `/feed/posts/${postId}/bookmark`
    );
    return data;
  },

  /**
   * Get user's bookmarked posts
   */
  async getBookmarks(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginationResponse<FeedPost>> {
    const { data } = await apiClient.get<PaginationResponse<FeedPost>>(
      "/feed/bookmarks",
      { params }
    );
    return data;
  },

  /**
   * Get comments for a post
   */
  async getComments(
    postId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginationResponse<FeedComment>> {
    const { data } = await apiClient.get<PaginationResponse<FeedComment>>(
      `/feed/posts/${postId}/comments`,
      { params }
    );
    return data;
  },

  /**
   * Create a comment
   */
  async createComment(
    postId: string,
    payload: CreateCommentPayload
  ): Promise<FeedComment> {
    const { data } = await apiClient.post<FeedComment>(
      `/feed/posts/${postId}/comments`,
      payload
    );
    return data;
  },

  /**
   * Update a comment
   */
  async updateComment(commentId: string, content: string): Promise<FeedComment> {
    const { data } = await apiClient.put<FeedComment>(
      `/feed/comments/${commentId}`,
      { content }
    );
    return data;
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(`/feed/comments/${commentId}`);
  },

  /**
   * Like/unlike a comment
   */
  async likeComment(commentId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    const { data } = await apiClient.post<{ isLiked: boolean; likesCount: number }>(
      `/feed/comments/${commentId}/like`
    );
    return data;
  },

  /**
   * Report content
   */
  async reportContent(payload: {
    postId?: string;
    commentId?: string;
    reason: ReportReason;
    description?: string;
  }): Promise<void> {
    await apiClient.post("/feed/report", payload);
  },

  /**
   * Get trending tags
   */
  async getTrendingTags(): Promise<string[]> {
    const { data } = await apiClient.get<string[]>(
      "/feed/trending-tags"
    );
    return data;
  },

  /**
   * Get pinned posts
   */
  async getPinnedPosts(): Promise<FeedPost[]> {
    const { data } = await apiClient.get<FeedPost[]>(
      "/feed/pinned"
    );
    return data;
  },

  /**
   * Get trending posts
   */
  async getTrendingPosts(limit: number = 3): Promise<FeedPost[]> {
    const { data } = await apiClient.get<FeedPost[]>(
      "/feed/trending",
      { params: { limit } }
    );
    return data;
  },

  /**
   * Get latest posts
   */
  async getLatestPosts(limit: number = 3): Promise<FeedPost[]> {
    const { data } = await apiClient.get<FeedPost[]>(
      "/feed/latest",
      { params: { limit } }
    );
    return data;
  },

  /**
   * Search posts
   */
  async searchPosts(params: {
    q: string;
    page?: number;
    limit?: number;
  }): Promise<PaginationResponse<FeedPost>> {
    const { data } = await apiClient.get<PaginationResponse<FeedPost>>(
      "/feed/search",
      { params }
    );
    return data;
  },
};
