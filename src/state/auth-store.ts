import { createPersistedStore } from "./store-config";

export type UserRole = "student" | "mentor" | "judge" | "admin" | "super-admin" | null;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
};

/**
 * Authentication store with persistence
 * User data persists across page refreshes
 */
export const useAuthStore = createPersistedStore<AuthState>(
  "tic-auth",
  (set) => ({
    user: null,
    loading: false,
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    logout: () => set({ user: null, loading: false }),
  }),
  {
    // Only persist user data, not loading state
    partialize: (state) => ({ user: state.user }),
  }
);


