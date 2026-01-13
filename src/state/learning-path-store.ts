import { createPersistedStore } from "./store-config";

type LearningPathState = {
  enrolledPaths: string[];
  isLoadingEnrollment: Record<string, boolean>;
  setEnrolled: (pathId: string) => void;
  setUnenrolled: (pathId: string) => void;
  checkEnrollment: (pathId: string) => boolean;
  setLoadingEnrollment: (pathId: string, loading: boolean) => void;
  clearEnrollment: () => void;
};

/**
 * Learning Path store with persistence
 * Tracks enrollment status for learning paths
 */
export const useLearningPathStore = createPersistedStore<LearningPathState>(
  "learning-path-store",
  (set, get) => ({
    enrolledPaths: [],
    isLoadingEnrollment: {},

    setEnrolled: (pathId: string) =>
      set((state) => ({
        enrolledPaths: state.enrolledPaths.includes(pathId)
          ? state.enrolledPaths
          : [...state.enrolledPaths, pathId],
        isLoadingEnrollment: { ...state.isLoadingEnrollment, [pathId]: false },
      })),

    setUnenrolled: (pathId: string) =>
      set((state) => ({
        enrolledPaths: state.enrolledPaths.filter((id) => id !== pathId),
        isLoadingEnrollment: { ...state.isLoadingEnrollment, [pathId]: false },
      })),

    checkEnrollment: (pathId: string) => {
      const state = get();
      return state.enrolledPaths.includes(pathId);
    },

    setLoadingEnrollment: (pathId: string, loading: boolean) =>
      set((state) => ({
        isLoadingEnrollment: { ...state.isLoadingEnrollment, [pathId]: loading },
      })),

    clearEnrollment: () =>
      set({
        enrolledPaths: [],
        isLoadingEnrollment: {},
      }),
  }),
  {
    encrypt: false, // Enrollment status doesn't need encryption
  }
);
