/**
 * Subscription store — stubbed out until react-native-iap
 * is compatible with our Expo SDK / RN version.
 *
 * TODO: Re-add react-native-iap when Expo SDK supports RN 0.79+
 * (required for NitroModules-based IAP v14+).
 */

import { create } from 'zustand';
import { useAuthStore } from './authStore';

interface SubscriptionState {
  isReady: boolean;
  isLoading: boolean;
  product: null;
  error: string | null;

  init: () => Promise<void>;
  purchase: () => Promise<void>;
  restore: () => Promise<void>;
  teardown: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isReady: false,
  isLoading: false,
  product: null,
  error: null,

  init: async () => {
    // Stub: mark as ready with no product available
    set({ isReady: true });
  },

  purchase: async () => {
    set({ error: 'In-app purchases are not yet available.' });
  },

  restore: async () => {
    set({ error: 'In-app purchases are not yet available.' });
  },

  teardown: () => {},
}));
