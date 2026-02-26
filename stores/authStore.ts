/**
 * Auth store - Zustand
 * Manages authentication state, Cognito integration, and secure token storage
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import {
  signUp as cognitoSignUp,
  confirmSignUp as cognitoConfirm,
  resendConfirmation as cognitoResend,
  signIn as cognitoSignIn,
  signOut as cognitoSignOut,
  getCurrentSession,
  getAccessToken,
  getIdToken,
  getUserSub,
} from '../lib/cognito';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  email: string | null;
  name: string | null;
  tier: 'free' | 'pro';
  accessToken: string | null;
  idToken: string | null;
  error: string | null;

  // Pending verification state
  pendingEmail: string | null;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  confirmSignUp: (code: string) => Promise<void>;
  resendCode: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const STORE_KEY_EMAIL = 'driftlab_email';
const STORE_KEY_NAME = 'driftlab_name';
const STORE_KEY_TIER = 'driftlab_tier';

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  userId: null,
  email: null,
  name: null,
  tier: 'free',
  accessToken: null,
  idToken: null,
  error: null,
  pendingEmail: null,

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      const session = await getCurrentSession();
      if (session && session.isValid()) {
        const email = await SecureStore.getItemAsync(STORE_KEY_EMAIL);
        const name = await SecureStore.getItemAsync(STORE_KEY_NAME);
        const storedTier = await SecureStore.getItemAsync(STORE_KEY_TIER);
        const tier = (storedTier === 'pro' ? 'pro' : 'free') as 'free' | 'pro';

        set({
          isAuthenticated: true,
          userId: getUserSub(session),
          email,
          name,
          tier,
          accessToken: getAccessToken(session),
          idToken: getIdToken(session),
          isLoading: false,
        });
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    try {
      set({ isLoading: true, error: null });
      await cognitoSignUp(email, password, name);

      // Store email for verification flow
      await SecureStore.setItemAsync(STORE_KEY_EMAIL, email);
      await SecureStore.setItemAsync(STORE_KEY_NAME, name);

      set({
        pendingEmail: email,
        email,
        name,
        isLoading: false,
      });
    } catch (err: any) {
      const message = err?.message ?? 'Sign up failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  confirmSignUp: async (code: string) => {
    const { pendingEmail } = get();
    if (!pendingEmail) {
      set({ error: 'No email pending verification' });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      await cognitoConfirm(pendingEmail, code);
      set({ pendingEmail: null, isLoading: false });
    } catch (err: any) {
      const message = err?.message ?? 'Verification failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  resendCode: async () => {
    const { pendingEmail } = get();
    if (!pendingEmail) return;

    try {
      set({ error: null });
      await cognitoResend(pendingEmail);
    } catch (err: any) {
      set({ error: err?.message ?? 'Failed to resend code' });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const session = await cognitoSignIn(email, password);

      await SecureStore.setItemAsync(STORE_KEY_EMAIL, email);

      set({
        isAuthenticated: true,
        userId: getUserSub(session),
        email,
        accessToken: getAccessToken(session),
        idToken: getIdToken(session),
        isLoading: false,
        pendingEmail: null,
      });
    } catch (err: any) {
      let message = err?.message ?? 'Sign in failed';
      if (err?.code === 'UserNotConfirmedException') {
        set({ pendingEmail: email, isLoading: false, error: null });
        throw err;
      }
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  signOut: async () => {
    const { email } = get();
    if (email) {
      cognitoSignOut(email);
    }
    await SecureStore.deleteItemAsync(STORE_KEY_EMAIL);
    await SecureStore.deleteItemAsync(STORE_KEY_NAME);

    set({
      isAuthenticated: false,
      userId: null,
      email: null,
      name: null,
      tier: 'free',
      accessToken: null,
      idToken: null,
      pendingEmail: null,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
