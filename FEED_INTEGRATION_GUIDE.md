# TIC Feed Integration Guide

## Overview
This document outlines the integration of the TIC Feed feature with the backend API. The feed service, components, and WebSocket integration have been created and are ready for use.

## Files Created

### 1. Service Layer
- **`src/lib/services/feedService.ts`** - Complete API service with all endpoints
  - Posts CRUD operations
  - Likes, comments, views, bookmarks
  - Reporting and moderation
  - Trending tags

### 2. Components
- **`components/dashboard/feed/CreatePostModal.tsx`** - Modal for creating posts
  - Category selection
  - Title and content
  - Tags (max 5)
  - Image upload
  - File attachments
  - Uses `/f/upload` endpoint (base64 format)

### 3. Socket Types
- **`ticportal-v2-backend/src/socket/types.ts`** - Updated with feed events
  - Client → Server: `feed:join`, `feed:leave`, `feed:typing:comment`, `feed:post:view`
  - Server → Client: All feed update events

## Integration Steps

### Step 1: Update the Feed Page
Replace the current `app/[locale]/(dashboard)/student/tic-feed/page.tsx` with a fully integrated version that:
- Uses `feedService` for API calls
- Connects to WebSocket for real-time updates
- Implements pagination
- Handles all interactions (like, comment, bookmark, etc.)

### Step 2: Create FeedPostCard Component
Create `components/dashboard/feed/FeedPostCard.tsx` that:
- Displays post with author, content, media
- Handles likes, comments, views
- Shows engagement metrics
- Supports nested comments
- Handles real-time updates via WebSocket

### Step 3: Create CommentSection Component
Create `components/dashboard/feed/CommentSection.tsx` that:
- Displays comments with nested replies
- Handles comment creation/editing
- Shows typing indicators
- Updates in real-time

### Step 4: WebSocket Integration
In the feed page, add:
```typescript
import { connectSocket, useSocketEvent } from '@/src/lib/socket';
import { useAuthStore } from '@/src/state/auth-store';

// Connect socket
const { accessToken } = useAuthStore();
const socket = connectSocket(accessToken);

// Join feed room
useEffect(() => {
  if (socket && activeTab) {
    socket.emit('feed:join', { 
      category: activeTab === 'all' ? undefined : activeTab.toUpperCase() 
    });
  }
  return () => {
    socket?.emit('feed:leave');
  };
}, [socket, activeTab]);

// Listen for real-time updates
useSocketEvent('feed:post:created', (data) => {
  // Add new post to feed
});

useSocketEvent('feed:post:liked', (data) => {
  // Update post likes
});

// ... other events
```

### Step 5: File Upload
The `CreatePostModal` already uses the correct upload endpoint:
- Endpoint: `/api/f/upload`
- Format: Base64 encoded file
- Request: `{ file: base64String, fileName: string }`
- Response: `{ success: true, data: { url: string } }`

## Key Features to Implement

### 1. Post Creation
- Use `CreatePostModal` component
- Handle category selection (for students, default to "GENERAL")
- Support image and file attachments
- Add tags (optional, max 5)

### 2. Real-time Updates
- Connect to WebSocket on page load
- Join appropriate room based on category
- Listen for all feed events
- Update UI immediately on events

### 3. Interactions
- **Like**: `feedService.likePost(postId)`
- **Comment**: `feedService.createComment(postId, { content, parentId })`
- **Bookmark**: `feedService.bookmarkPost(postId)`
- **View**: `feedService.viewPost(postId)` (debounced)

### 4. Pagination
- Use `page` and `limit` query params
- Implement infinite scroll or "Load More"
- Handle loading states

### 5. Category Filtering
- For students: Only show "GENERAL" category (no category selector)
- For mentors/admin: Show all categories
- Map UI tabs to API categories:
  - "all" → no category filter
  - "announcements" → "ANNOUNCEMENTS"
  - "mentorship" → "MENTORSHIP"
  - "updates" → "TEAM_UPDATES"

## Next Steps

1. **Create FeedPostCard component** - Display posts with all interactions
2. **Create CommentSection component** - Handle comments and replies
3. **Update main feed page** - Integrate service, WebSocket, and components
4. **Add error handling** - Handle API errors gracefully
5. **Add loading states** - Show spinners during operations
6. **Test real-time updates** - Verify WebSocket events work correctly

## Testing Checklist

- [ ] Create post with image
- [ ] Create post with attachment
- [ ] Like/unlike post
- [ ] Comment on post
- [ ] Reply to comment
- [ ] Bookmark post
- [ ] View post (track views)
- [ ] Real-time post creation
- [ ] Real-time like updates
- [ ] Real-time comment updates
- [ ] Category filtering
- [ ] Pagination
- [ ] Error handling
- [ ] Mobile responsiveness

## Notes

- The upload endpoint expects base64 format, not FormData
- WebSocket must be always connected when on feed page
- For students, category is automatically "GENERAL"
- All interactions should update UI optimistically, then sync with server
- Use debouncing for view tracking (max 1 view per user per post per minute)
