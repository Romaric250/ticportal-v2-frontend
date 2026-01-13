import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import type { StateCreator } from "zustand";
import { getEncryptedItem, setEncryptedItem, removeEncryptedItem } from "../utils/encryption";

/**
 * Encrypted localStorage storage adapter for Zustand
 * Wraps localStorage with encryption/decryption
 */
const encryptedStorage: StateStorage = {
  getItem: (name: string): string | null => {
    return getEncryptedItem(name);
  },
  setItem: (name: string, value: string): void => {
    setEncryptedItem(name, value);
  },
  removeItem: (name: string): void => {
    removeEncryptedItem(name);
  },
};

/**
 * Zustand store configuration with persist middleware and encryption
 * This provides a reusable pattern for creating stores with persistence
 */
export function createPersistedStore<T>(
  name: string,
  storeCreator: StateCreator<T>,
  options?: {
    partialize?: (state: T) => Partial<T>;
    version?: number;
    encrypt?: boolean; // Option to enable encryption (default: true for sensitive stores)
  }
) {
  const shouldEncrypt = options?.encrypt !== false; // Default to true
  
  const persistConfig: any = {
    name,
    storage: shouldEncrypt 
      ? createJSONStorage(() => encryptedStorage)
      : createJSONStorage(() => localStorage),
    version: options?.version || 0,
  };
  
  if (options?.partialize) {
    persistConfig.partialize = options.partialize;
  }
  
  return create<T>()(persist(storeCreator, persistConfig));
}

/**
 * Zustand store configuration without persistence
 * Use this for temporary state that shouldn't persist across sessions
 */
export function createStore<T>(storeCreator: StateCreator<T>) {
  return create<T>()(storeCreator);
}

