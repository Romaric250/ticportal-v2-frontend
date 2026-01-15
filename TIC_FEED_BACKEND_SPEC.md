# TIC Feed Backend Specification

## Overview
The TIC Feed is a real-time social feed system for the TIC Summit portal. It allows users (ADMIN, MENTOR, STUDENT) to create posts, comment, like, and share updates. All interactions must be real-time using WebSocket connections.

---

## Database Schema

### 1. FeedPost Model
```prisma
model FeedPost {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  authorId    String   @db.ObjectId
  author      User     @relation("FeedPosts", fields: [authorId], references: [id])
  
  // Content
  title       String?  // Optional title for announcements
  content     String   // Main post content
  category    FeedPostCategory
  
  // Media & Attachments
  imageUrl    String?  // URL to uploaded image
  attachments FeedAttachment[]
  
  // Metadata
  isPinned    Boolean  @default(false)
  isOfficial  Boolean  @default(false) // For official announcements
  status      FeedPostStatus @default(ACTIVE)
  
  // Engagement metrics
  likesCount  Int      @default(0)
  commentsCount Int    @default(0)
  viewsCount  Int      @default(0)
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  pinnedAt    DateTime?
  
  // Relations
  likes       FeedLike[]
  comments    FeedComment[]
  views       FeedView[]
  
  @@index([authorId])
  @@index([category])
  @@index([isPinned, pinnedAt])
  @@index([createdAt])
  @@index([status])
}

enum FeedPostCategory {
  ALL
  ANNOUNCEMENTS  // Official announcements
  MENTORSHIP     // Mentorship-related posts
  UPDATES        // Team updates
  REGULAR       // for students, 
}

enum FeedPostStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}
```

### 2. FeedAttachment Model
```prisma
model FeedAttachment {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  postId      String   @db.ObjectId
  post        FeedPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  fileName    String
  fileUrl    String   // URL to file storage
  fileSize   Int      // Size in bytes
  mimeType   String   // e.g., "application/pdf", "image/png"
  
  createdAt   DateTime @default(now())
  
  @@index([postId])
}
```

### 3. FeedLike Model
```prisma
model FeedLike {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  postId      String   @db.ObjectId
  post        FeedPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId      String   @db.ObjectId
  user        User     @relation("FeedLikes", fields: [userId], references: [id])
  
  createdAt   DateTime @default(now())
  
  @@unique([postId, userId])
  @@index([postId])
  @@index([userId])
}
```

### 4. FeedComment Model
```prisma
model FeedComment {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  postId      String   @db.ObjectId
  post        FeedPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId    String   @db.ObjectId
  author      User     @relation("FeedComments", fields: [authorId], references: [id])
  parentId    String?  @db.ObjectId // For nested replies
  parent      FeedComment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies     FeedComment[] @relation("CommentReplies")
  
  content     String
  
  likesCount  Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([postId])
  @@index([authorId])
  @@index([parentId])
  @@index([createdAt])
}
```

### 5. FeedView Model (for tracking views)
```prisma
model FeedView {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  postId      String   @db.ObjectId
  post        FeedPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId      String   @db.ObjectId
  user        User     @relation("FeedViews", fields: [userId], references: [id])
  
  viewedAt    DateTime @default(now())
  
  @@unique([postId, userId]) // One view per user per post
  @@index([postId])
  @@index([userId])
}
```

### 6. Update User Model Relations
```prisma
model User {
  // ... existing fields ...
  
  feedPosts   FeedPost[]     @relation("FeedPosts")
  feedLikes   FeedLike[]     @relation("FeedLikes")
  feedComments FeedComment[] @relation("FeedComments")
  feedViews   FeedView[]     @relation("FeedViews")
}
```

---

## REST API Endpoints

### Base Path: `/api/feed`

### 1. Posts

#### GET `/api/feed/posts`
Get paginated list of posts with filters.

**Query Parameters:**
- `category?: "all" | "announcements" | "mentorship" | "updates"` | "regular" (default: "all"), if its a student logged, only cat is regular, by default, so noption to even selet cat typr.
- `page?: number` (default: 1)
- `limit?: number` (default: 20)
- `includePinned?: boolean` (default: true)

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "string",
        "author": {
          "id": "string",
          "fullName": "string",
          "email": "string",
          "role": "ADMIN" | "MENTOR" | "STUDENT",
          "avatarUrl": "string | null"
        },
        "title": "string | null",
        "content": "string",
        "category": "ANNOUNCEMENTS" | "MENTORSHIP" | "UPDATES",
        "imageUrl": "string | null",
        "attachments": [
          {
            "id": "string",
            "fileName": "string",
            "fileUrl": "string",
            "fileSize": "number",
            "mimeType": "string"
          }
        ],
        "isPinned": "boolean",
        "isOfficial": "boolean",
        "likesCount": "number",
        "commentsCount": "number",
        "viewsCount": "number",
        "isLiked": "boolean", // Whether current user liked it
        "createdAt": "ISO8601 string",
        "updatedAt": "ISO8601 string"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "totalPages": "number"
    }
  }
}
```

#### POST `/api/feed/posts`
Create a new post.

**Request Body:**
```json
{
  "title": "string | null", // Optional
  "content": "string", // Required
  "category": "ANNOUNCEMENTS" | "MENTORSHIP" | "UPDATES",
  "imageUrl": "string | null", // Optional, URL after upload
  "attachments": [
    {
      "fileName": "string",
      "fileUrl": "string",
      "fileSize": "number",
      "mimeType": "string"
    }
  ],
  "isOfficial": "boolean" // Only for ADMIN
}
```

**Response:** Same as single post object above

#### GET `/api/feed/posts/:postId`
Get a single post with full details.

**Response:** Single post object with comments included

#### PUT `/api/feed/posts/:postId`
Update a post (only by author or ADMIN).

**Request Body:** Same as POST, all fields optional

#### DELETE `/api/feed/posts/:postId`
Delete a post (only by author or ADMIN).

**Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

#### POST `/api/feed/posts/:postId/pin`
Pin/unpin a post (ADMIN only).

**Request Body:**
```json
{
  "isPinned": "boolean"
}
```

### 2. Likes

#### POST `/api/feed/posts/:postId/like`
Like or unlike a post.

**Response:**
```json
{
  "success": true,
  "data": {
    "isLiked": "boolean",
    "likesCount": "number"
  }
}
```

#### GET `/api/feed/posts/:postId/likes`
Get users who liked the post (paginated).

**Query Parameters:**
- `page?: number`
- `limit?: number`

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "string",
        "fullName": "string",
        "email": "string",
        "avatarUrl": "string | null",
        "likedAt": "ISO8601 string"
      }
    ],
    "pagination": { ... }
  }
}
```

### 3. Comments

#### GET `/api/feed/posts/:postId/comments`
Get comments for a post (paginated, with replies).

**Query Parameters:**
- `page?: number`
- `limit?: number`

**Response:**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "string",
        "author": {
          "id": "string",
          "fullName": "string",
          "email": "string",
          "role": "string",
          "avatarUrl": "string | null"
        },
        "content": "string",
        "parentId": "string | null",
        "replies": [ /* nested comments */ ],
        "likesCount": "number",
        "isLiked": "boolean",
        "createdAt": "ISO8601 string",
        "updatedAt": "ISO8601 string"
      }
    ],
    "pagination": { ... }
  }
}
```

#### POST `/api/feed/posts/:postId/comments`
Create a comment.

**Request Body:**
```json
{
  "content": "string",
  "parentId": "string | null" // For replies
}
```

**Response:** Single comment object

#### PUT `/api/feed/comments/:commentId`
Update a comment (only by author).

**Request Body:**
```json
{
  "content": "string"
}
```

#### DELETE `/api/feed/comments/:commentId`
Delete a comment (only by author or ADMIN).

#### POST `/api/feed/comments/:commentId/like`
Like or unlike a comment.

**Response:**
```json
{
  "success": true,
  "data": {
    "isLiked": "boolean",
    "likesCount": "number"
  }
}
```

### 4. Views

#### POST `/api/feed/posts/:postId/view`
Record a view (idempotent - won't duplicate).

**Response:**
```json
{
  "success": true,
  "data": {
    "viewsCount": "number"
  }
}
```

### 5. Pinned & Upcoming

#### GET `/api/feed/pinned`
Get all pinned posts.

**Response:** Array of post objects

#### GET `/api/feed/upcoming`
Get upcoming events (if integrated with calendar system).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "date": "ISO8601 string",
      "event": "string",
      "detail": "string"
    }
  ]
}
```

---

## Socket Events

### Connection Requirements
- Socket must be **always connected** when user is on the feed page
- Authentication via JWT token in socket auth
- Auto-reconnect on disconnect
- Connection status should be visible to user

### Client to Server Events (Emit)

#### `feed:join`
Join the feed room to receive real-time updates.

**Payload:**
```typescript
{
  category?: "all" | "announcements" | "mentorship" | "updates"
}
```

**Usage:** Emit when user opens feed or switches category tab.

#### `feed:leave`
Leave the feed room.

**Payload:** None

#### `feed:post:view`
Notify server that user is viewing a post (for real-time view count).

**Payload:**
```typescript
{
  postId: string
}
```

#### `feed:typing:comment`
Indicate user is typing a comment.

**Payload:**
```typescript
{
  postId: string,
  isTyping: boolean
}
```

### Server to Client Events (Listen)

#### `feed:post:created`
New post created (broadcast to all users in feed room).

**Payload:**
```typescript
{
  post: {
    id: string,
    author: {
      id: string,
      fullName: string,
      email: string,
      role: "ADMIN" | "MENTOR" | "STUDENT",
      avatarUrl: string | null
    },
    title: string | null,
    content: string,
    category: "ANNOUNCEMENTS" | "MENTORSHIP" | "UPDATES",
    imageUrl: string | null,
    attachments: Array<{...}>,
    isPinned: boolean,
    isOfficial: boolean,
    likesCount: number,
    commentsCount: number,
    viewsCount: number,
    isLiked: boolean,
    createdAt: string
  }
}
```

#### `feed:post:updated`
Post updated (broadcast to all users viewing that post).

**Payload:**
```typescript
{
  postId: string,
  updates: {
    title?: string,
    content?: string,
    imageUrl?: string,
    // ... other updated fields
  }
}
```

#### `feed:post:deleted`
Post deleted (broadcast to all users).

**Payload:**
```typescript
{
  postId: string
}
```

#### `feed:post:pinned`
Post pinned/unpinned (ADMIN only, broadcast to all).

**Payload:**
```typescript
{
  postId: string,
  isPinned: boolean
}
```

#### `feed:post:liked`
Post liked/unliked (broadcast to all users viewing that post).

**Payload:**
```typescript
{
  postId: string,
  userId: string,
  userName: string,
  isLiked: boolean,
  likesCount: number
}
```

#### `feed:comment:created`
New comment created.

**Payload:**
```typescript
{
  postId: string,
  comment: {
    id: string,
    author: {
      id: string,
      fullName: string,
      email: string,
      role: string,
      avatarUrl: string | null
    },
    content: string,
    parentId: string | null,
    likesCount: number,
    createdAt: string
  },
  commentsCount: number // Updated total count
}
```

#### `feed:comment:updated`
Comment updated.

**Payload:**
```typescript
{
  postId: string,
  commentId: string,
  content: string,
  updatedAt: string
}
```

#### `feed:comment:deleted`
Comment deleted.

**Payload:**
```typescript
{
  postId: string,
  commentId: string,
  commentsCount: number // Updated total count
}
```

#### `feed:comment:liked`
Comment liked/unliked.

**Payload:**
```typescript
{
  postId: string,
  commentId: string,
  userId: string,
  isLiked: boolean,
  likesCount: number
}
```

#### `feed:view:incremented`
Post view count incremented.

**Payload:**
```typescript
{
  postId: string,
  viewsCount: number
}
```

#### `feed:typing:comment`
User is typing a comment (broadcast to others viewing the post).

**Payload:**
```typescript
{
  postId: string,
  userId: string,
  userName: string,
  isTyping: boolean
}
```

#### `feed:error`
Error occurred.

**Payload:**
```typescript
{
  message: string,
  code?: string
}
```

---

## Socket Implementation Notes

### 1. Room Management
- Create rooms per category: `feed:all`, `feed:announcements`, `feed:mentorship`, `feed:updates`
- Users join room when they select a category tab
- Broadcast events to appropriate room based on post category

### 2. Authentication
- Use JWT token from socket auth middleware
- Verify user permissions (e.g., only ADMIN can pin posts)
- Store `userId` and `user` object on socket

### 3. Real-time Updates Flow
```
User Action → REST API → Database Update → Socket Emit → All Connected Clients
```

Example:
1. User likes a post → `POST /api/feed/posts/:id/like`
2. Backend updates database
3. Backend emits `feed:post:liked` to room
4. All clients in room receive update and update UI

### 4. View Tracking
- Track views via socket for real-time updates
- Also record in database via REST API for persistence
- Use debouncing to avoid spam (max 1 view per user per post per minute)

### 5. Typing Indicators
- Emit `feed:typing:comment` when user starts typing
- Auto-stop after 3 seconds of inactivity
- Broadcast to all users viewing that specific post

### 6. Connection Management
- Socket should connect on app load (if authenticated)
- Reconnect automatically on disconnect
- Show connection status indicator
- Queue actions if disconnected, sync when reconnected

---

## File Upload

### POST `/api/feed/upload`
Upload image or attachment for posts.

**Request:** Multipart form data
- `file`: File
- `type`: "image" | "attachment"

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "string", // Full URL to uploaded file
    "fileName": "string",
    "fileSize": "number",
    "mimeType": "string"
  }
}
```

---

## Permissions

### Post Creation
- **STUDENT**: Can create posts in MENTORSHIP and UPDATES categories
- **MENTOR**: Can create posts in MENTORSHIP and UPDATES categories
- **ADMIN**: Can create posts in all categories, can mark as official

### Post Modification
- Author can edit/delete their own posts
- ADMIN can edit/delete any post
- ADMIN can pin/unpin any post

### Comments
- All authenticated users can comment
- Author can edit/delete their own comments
- ADMIN can delete any comment

### Likes
- All authenticated users can like posts and comments

---

## Performance Considerations

1. **Pagination**: Always paginate posts and comments (default 20 per page)
2. **Caching**: Cache pinned posts and popular posts
3. **Indexes**: Ensure database indexes on frequently queried fields
4. **Debouncing**: Debounce view tracking and typing indicators
5. **Rate Limiting**: Implement rate limiting on post creation and comments
6. **Image Optimization**: Compress and optimize images before storage

---

## Example Socket Connection Flow

```typescript
// Frontend
import { connectSocket, useSocketEvent } from '@/lib/socket';

// Connect on page load
const socket = connectSocket(accessToken);

// Join feed room
socket.emit('feed:join', { category: 'all' });

// Listen for new posts
useSocketEvent('feed:post:created', (data) => {
  // Add new post to feed
  setPosts(prev => [data.post, ...prev]);
});

// Listen for like updates
useSocketEvent('feed:post:liked', (data) => {
  // Update post likes count
  updatePostLikes(data.postId, data.likesCount, data.isLiked);
});

// Cleanup on unmount
useEffect(() => {
  return () => {
    socket.emit('feed:leave');
  };
}, []);
```

---

## Summary Checklist

- [ ] Database schema implemented (FeedPost, FeedAttachment, FeedLike, FeedComment, FeedView)
- [ ] REST API endpoints implemented
- [ ] Socket.io server configured with authentication
- [ ] Socket events defined and implemented
- [ ] Room management for categories
- [ ] Real-time updates for posts, comments, likes, views
- [ ] Typing indicators for comments
- [ ] File upload endpoint
- [ ] Permission checks
- [ ] Rate limiting
- [ ] Error handling
- [ ] Connection status management
- [ ] Auto-reconnect logic
