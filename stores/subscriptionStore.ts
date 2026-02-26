/**
 * Subscription store — direct StoreKit integration via react-native-iap v14.
 * Manages purchase state and syncs tier with authStore.
 */

import { create } from 'zustand';
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  ErrorCode,
  type ProductOrSubscription,
  type Purchase,
  type EventSubscription,
} from 'react-native-iap';
import { useAuthStore } from './authStore';

const PRODUCT_ID = 'pro_monthly';

interface SubscriptionState {
  isReady: boolean;
  isLoading: boolean;
  product: ProductOrSubscription | null;
  error: string | null;

  init: () => Promise<void>;
  purchase: () => Promise<void>;
  restore: () => Promise<void>;
  teardown: () => void;
}

let purchaseUpdateSub: EventSubscription | null = null;
let purchaseErrorSub: EventSubscription | null = null;

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
        if (error.code !== ErrorCode.UserCancelled) {
          set({ error: error.message, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      });

      // Fetch subscription product info
      const products = await fetchProducts({ skus: [PRODUCT_ID], type: 'subs' });
      const product = products?.find((p) => p.id === PRODUCT_ID) ?? null;

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
      await requestPurchase({ request: { apple: { sku: PRODUCT_ID } }, type: 'subs' });
      // Completion handled by purchaseUpdatedListener
    } catch (err: any) {
      if (err.code !== ErrorCode.UserCancelled) {
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
