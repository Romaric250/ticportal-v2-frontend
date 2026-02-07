import { createPersistedStore } from "./store-config";
import { tokenStorage } from "../lib/api-client";

export type UserRole = "student" | "mentor" | "judge" | "admin" | "super-admin" | "affiliate" | null;

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
  initialized: boolean;
  setUser: (user: AuthUser | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
  logout: () => void;
};

/**
 * Authentication store with persistence
 * User data and tokens persist across page refreshes
 */
export const useAuthStore = createPersistedStore<AuthState>(
  "tic-auth",
  (set, get) => {
    // Initialize tokens from storage on store creation
    let initialAccessToken: string | null = null;
    let initialRefreshToken: string | null = null;
    
    if (typeof window !== "undefined") {
      initialAccessToken = tokenStorage.getAccessToken();
      initialRefreshToken = tokenStorage.getRefreshToken();
    }

    return {
      user: null,
      accessToken: initialAccessToken,
      refreshToken: initialRefreshToken,
      loading: false,
      initialized: false,
      setUser: (user) => set({ user }),
      setTokens: (accessToken, refreshToken) => {
        tokenStorage.setAccessToken(accessToken);
        tokenStorage.setRefreshToken(refreshToken);
        set({ accessToken, refreshToken });
      },
      setLoading: (loading) => set({ loading }),
      initialize: () => {
        // Sync tokens from storage on initialization
        if (typeof window !== "undefined") {
          const storedAccessToken = tokenStorage.getAccessToken();
          const storedRefreshToken = tokenStorage.getRefreshToken();
          
          // Always sync tokens from storage
          if (storedAccessToken !== get().accessToken) {
            set({ accessToken: storedAccessToken });
          }
          if (storedRefreshToken !== get().refreshToken) {
            set({ refreshToken: storedRefreshToken });
          }
        }
        set({ initialized: true });
      },
      logout: () => {
        tokenStorage.clearTokens();
        set({ user: null, accessToken: null, refreshToken: null, loading: false });
      },
    };
  },
  {
    // Persist user data and tokens
    partialize: (state) => ({
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
    }),
  }
);


