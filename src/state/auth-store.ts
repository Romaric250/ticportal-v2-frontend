import { createPersistedStore } from "./store-config";
import { tokenStorage } from "../lib/api-client";

export type UserRole = "student" | "mentor" | "judge" | "admin" | "super-admin" | null;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
};

/**
 * Authentication store with persistence
 * User data and tokens persist across page refreshes
 */
export const useAuthStore = createPersistedStore<AuthState>(
  "tic-auth",
  (set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: false,
    setUser: (user) => set({ user }),
    setTokens: (accessToken, refreshToken) => {
      tokenStorage.setAccessToken(accessToken);
      tokenStorage.setRefreshToken(refreshToken);
      set({ accessToken, refreshToken });
    },
    setLoading: (loading) => set({ loading }),
    logout: () => {
      tokenStorage.clearTokens();
      set({ user: null, accessToken: null, refreshToken: null, loading: false });
    },
  }),
  {
    // Persist user data and tokens
    partialize: (state) => ({
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
    }),
  }
);


