# Zustand State Management Setup

This project uses [Zustand](https://github.com/pmndrs/zustand) for state management. Zustand is a lightweight, unopinionated state management solution that works great with React.

## Structure

```
src/state/
├── index.ts              # Centralized exports
├── store-config.ts       # Store configuration utilities
├── auth-store.ts         # Authentication state
├── ui-store.ts           # UI state (modals, sidebar, etc.)
├── notification-store.ts  # Notification state
└── team-store.ts         # Team state
```

## Available Stores

### 1. Auth Store (`useAuthStore`)

Manages authentication state with persistence.

```tsx
import { useAuthStore } from "@/src/state";

function MyComponent() {
  const { user, loading, setUser, logout } = useAuthStore();
  
  // Access user data
  if (user) {
    console.log(user.name, user.email, user.role);
  }
  
  // Update user
  setUser({ id: "1", name: "John", email: "john@example.com", role: "student" });
  
  // Logout
  logout();
}
```

### 2. UI Store (`useUIStore`)

Manages UI-related state (modals, sidebar, toasts). This is temporary state and doesn't persist.

```tsx
import { useUIStore } from "@/src/state";

function MyComponent() {
  const { 
    sidebarCollapsed, 
    toggleSidebar,
    modals,
    openModal,
    closeModal 
  } = useUIStore();
  
  // Sidebar
  <button onClick={toggleSidebar}>
    {sidebarCollapsed ? "Expand" : "Collapse"}
  </button>
  
  // Modals
  <button onClick={() => openModal("notifications")}>
    Open Notifications
  </button>
  
  {modals.notifications && (
    <Modal onClose={() => closeModal("notifications")}>
      {/* Modal content */}
    </Modal>
  )}
}
```

### 3. Notification Store (`useNotificationStore`)

Manages notifications with persistence.

```tsx
import { useNotificationStore } from "@/src/state";

function MyComponent() {
  const { 
    notifications, 
    unreadCount,
    addNotification,
    markAsRead,
    removeNotification 
  } = useNotificationStore();
  
  // Add notification
  addNotification({
    title: "New Message",
    message: "You have a new message from John",
    type: "info",
    actionUrl: "/messages",
  });
  
  // Mark as read
  markAsRead(notificationId);
  
  // Remove notification
  removeNotification(notificationId);
}
```

### 4. Team Store (`useTeamStore`)

Manages team data with persistence.

```tsx
import { useTeamStore } from "@/src/state";

function MyComponent() {
  const { 
    currentTeam,
    setCurrentTeam,
    addMember,
    removeMember,
    updateMember,
    setMentor 
  } = useTeamStore();
  
  // Set team
  setCurrentTeam({
    id: "team-1",
    name: "The Code Warriors",
    members: [...],
  });
  
  // Add member
  addMember({
    id: "member-1",
    name: "Jane Doe",
    email: "jane@example.com",
    role: "member",
  });
  
  // Update member
  updateMember("member-1", { online: true });
  
  // Set mentor
  setMentor({
    id: "mentor-1",
    name: "Dr. Smith",
    email: "smith@example.com",
  });
}
```

## Creating New Stores

### With Persistence

Use `createPersistedStore` for state that should persist across page refreshes:

```tsx
import { createPersistedStore } from "@/src/state/store-config";

type MyState = {
  data: string;
  setData: (data: string) => void;
};

export const useMyStore = createPersistedStore<MyState>(
  "my-store-key", // localStorage key
  (set) => ({
    data: "",
    setData: (data) => set({ data }),
  }),
  {
    // Optional: only persist specific fields
    partialize: (state) => ({ data: state.data }),
  }
);
```

### Without Persistence

Use `createStore` for temporary state:

```tsx
import { createStore } from "@/src/state/store-config";

type MyState = {
  tempData: string;
  setTempData: (data: string) => void;
};

export const useMyStore = createStore<MyState>((set) => ({
  tempData: "",
  setTempData: (data) => set({ tempData: data }),
}));
```

## Best Practices

1. **Import from centralized location:**
   ```tsx
   import { useAuthStore, useUIStore } from "@/src/state";
   ```

2. **Select specific state to avoid unnecessary re-renders:**
   ```tsx
   // ❌ Bad - re-renders on any state change
   const store = useAuthStore();
   
   // ✅ Good - only re-renders when user changes
   const user = useAuthStore((state) => state.user);
   ```

3. **Use actions, not direct state mutations:**
   ```tsx
   // ❌ Bad
   const store = useAuthStore();
   store.user = newUser; // Don't do this!
   
   // ✅ Good
   const setUser = useAuthStore((state) => state.setUser);
   setUser(newUser);
   ```

4. **Keep stores focused:**
   - One store per domain (auth, UI, notifications, etc.)
   - Don't mix unrelated state in one store

5. **Use TypeScript:**
   - Always type your stores
   - Export types for reuse

## Store Configuration

The `store-config.ts` file provides utilities:

- **`createPersistedStore`**: Creates a store with localStorage persistence
- **`createStore`**: Creates a store without persistence

Both use Zustand's `create` function under the hood with proper TypeScript typing.

## Migration from Other State Management

If you're migrating from other state management solutions:

- **Redux**: Zustand is much simpler, no actions/reducers needed
- **Context API**: Zustand avoids prop drilling and re-render issues
- **Jotai**: Similar atomic approach, but Zustand is more straightforward for global state

## Debugging

Zustand stores can be inspected in React DevTools. For better debugging, you can add middleware:

```tsx
import { devtools } from "zustand/middleware";

export const useMyStore = create<MyState>()(
  devtools(
    (set) => ({
      // store implementation
    }),
    { name: "MyStore" }
  )
);
```

## Examples

See the existing stores for examples:
- `auth-store.ts` - Simple state with persistence
- `ui-store.ts` - Complex state without persistence
- `notification-store.ts` - Array management with persistence
- `team-store.ts` - Nested object updates with persistence

