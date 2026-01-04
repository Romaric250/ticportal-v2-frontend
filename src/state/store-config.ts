import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StateCreator } from "zustand";

/**
 * Zustand store configuration with persist middleware
 * This provides a reusable pattern for creating stores with persistence
 */
export function createPersistedStore<T>(
  name: string,
  storeCreator: StateCreator<T>,
  options?: {
    partialize?: (state: T) => Partial<T>;
    version?: number;
  }
) {
  return create<T>()(
    persist(storeCreator, {
      name,
      storage: createJSONStorage(() => localStorage),
      partialize: options?.partialize,
      version: options?.version || 0,
    })
  );
}

/**
 * Zustand store configuration without persistence
 * Use this for temporary state that shouldn't persist across sessions
 */
export function createStore<T>(storeCreator: StateCreator<T>) {
  return create<T>()(storeCreator);
}

