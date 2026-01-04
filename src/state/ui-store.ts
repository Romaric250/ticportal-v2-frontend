import { createStore } from "./store-config";

type UIState = {
  // Sidebar state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Modal states
  modals: {
    notifications: boolean;
    teamChat: boolean;
    requestMentorship: boolean;
    addMember: boolean;
  };
  openModal: (modal: keyof UIState["modals"]) => void;
  closeModal: (modal: keyof UIState["modals"]) => void;
  closeAllModals: () => void;

  // Toast notifications (if needed beyond sonner)
  toasts: Array<{
    id: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>;
  addToast: (message: string, type: UIState["toasts"][0]["type"]) => void;
  removeToast: (id: string) => void;
};

/**
 * UI state store for managing UI-related state
 * This is temporary state and doesn't persist
 */
export const useUIStore = createStore<UIState>((set) => ({
  // Sidebar
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Modals
  modals: {
    notifications: false,
    teamChat: false,
    requestMentorship: false,
    addMember: false,
  },
  openModal: (modal) =>
    set((state) => ({
      modals: { ...state.modals, [modal]: true },
    })),
  closeModal: (modal) =>
    set((state) => ({
      modals: { ...state.modals, [modal]: false },
    })),
  closeAllModals: () =>
    set({
      modals: {
        notifications: false,
        teamChat: false,
        requestMentorship: false,
        addMember: false,
      },
    }),

  // Toasts
  toasts: [],
  addToast: (message, type) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: Date.now().toString(),
          message,
          type,
        },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));

