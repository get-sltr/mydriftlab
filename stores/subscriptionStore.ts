/**
 * Subscription store — direct StoreKit integration via react-native-iap.
 * Manages purchase state and syncs tier with authStore.
 */

import { create } from 'zustand';
import {
  initConnection,
  endConnection,
  getSubscriptions,
  requestSubscription,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  type Subscription,
  type Purchase,
} from 'react-native-iap';
import { useAuthStore } from './authStore';

const PRODUCT_ID = 'pro_monthly';

interface SubscriptionState {
  isReady: boolean;
  isLoading: boolean;
  product: Subscription | null;
  error: string | null;

  init: () => Promise<void>;
  purchase: () => Promise<void>;
  restore: () => Promise<void>;
  teardown: () => void;
}

let purchaseUpdateSub: { remove(): void } | null = null;
let purchaseErrorSub: { remove(): void } | null = null;

function syncTier(isPro: boolean) {
  useAuthStore.getState().setTier(isPro ? 'pro' : 'free');
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  isReady: false,
  isLoading: false,
  product: null,
  error: null,

  init: async () => {
    try {
      await initConnection();

      // Listen for successful purchases
      purchaseUpdateSub = purchaseUpdatedListener(
        async (purchase: Purchase) => {
          await finishTransaction({ purchase, isConsumable: false });
          syncTier(true);
          set({ isLoading: false, error: null });
        },
      );

      // Listen for purchase errors
      purchaseErrorSub = purchaseErrorListener((error) => {
        if (error.code !== 'E_USER_CANCELLED') {
          set({ error: error.message, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      });

      // Fetch subscription product info
      const subscriptions = await getSubscriptions({ skus: [PRODUCT_ID] });
      const product = subscriptions?.find((p) => p.productId === PRODUCT_ID) ?? null;

      // Check for existing active subscription
      const purchases = await getAvailablePurchases();
      const hasActive = purchases.some((p: Purchase) => p.productId === PRODUCT_ID);
      if (hasActive) {
        syncTier(true);
      }

      set({ isReady: true, product });
    } catch {
      // In simulator / dev builds without StoreKit config, silently degrade
      set({ isReady: true, error: null });
    }
  },

  purchase: async () => {
    const { product } = get();
    if (!product) {
      set({ error: 'Product not available' });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      await requestSubscription({ sku: PRODUCT_ID });
      // Completion handled by purchaseUpdatedListener
    } catch (err: any) {
      if (err.code !== 'E_USER_CANCELLED') {
        set({ error: err.message ?? 'Purchase failed', isLoading: false });
      } else {
        set({ isLoading: false });
      }
    }
  },

  restore: async () => {
    try {
      set({ isLoading: true, error: null });
      const purchases = await getAvailablePurchases();
      const hasActive = purchases.some((p: Purchase) => p.productId === PRODUCT_ID);

      syncTier(hasActive);
      set({
        isLoading: false,
        error: hasActive ? null : 'No active subscription found',
      });
    } catch (err: any) {
      set({ error: err.message ?? 'Restore failed', isLoading: false });
    }
  },

  teardown: () => {
    purchaseUpdateSub?.remove();
    purchaseErrorSub?.remove();
    purchaseUpdateSub = null;
    purchaseErrorSub = null;
    endConnection();
  },
}));
