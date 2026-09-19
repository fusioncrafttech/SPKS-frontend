import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { getAccessToken, invalidateApiCache } from '@/lib/api';
import {
  AuthUser,
  fetchCurrentUser,
  loadPersistedUser,
  loginUser,
  logoutUser,
  persistUser,
  registerUser,
  deleteAccount as deleteAccountRequest,
} from '@/lib/auth';
import { getCurrentSubscription, isActiveSubscription, type Subscription } from '@/lib/payments';
import { clearCourseMemory } from '@/lib/catalog';

type AuthContextType = {
  user: AuthUser | null;
  isReady: boolean;
  isLoggedIn: boolean;
  hasActiveSubscription: boolean;
  subscription: Subscription | null;
  login: (input: { email: string; password: string }) => Promise<AuthUser>;
  register: (input: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    state?: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: (options?: { force?: boolean }) => Promise<AuthUser | null>;
  applySubscription: (input: { hasActiveSubscription?: boolean; subscription?: Subscription | null }) => void;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const userRef = useRef<AuthUser | null>(null);
  const lastRefreshAt = useRef(0);

  const setUser = useCallback((next: AuthUser | null) => {
    userRef.current = next;
    setUserState(next);
    void persistUser(next);
  }, []);

  const mergeSession = useCallback((input: {
    me?: AuthUser | null;
    current?: Subscription | null;
    keepExistingActive?: boolean;
  }) => {
    const prev = userRef.current;
    const base = input.me || prev;
    if (!base) return null;
    const subscription = input.current || input.me?.subscription || prev?.subscription || null;
    const fromServer = isActiveSubscription(
      input.current ? true : input.me?.hasActiveSubscription,
      subscription,
    );
    const fromPrev = isActiveSubscription(prev?.hasActiveSubscription, prev?.subscription ?? null);
    const next: AuthUser = {
      ...base,
      subscription,
      hasActiveSubscription: fromServer || (input.keepExistingActive !== false && !input.current && fromPrev),
    };
    if (prev && isActiveSubscription(prev.hasActiveSubscription, prev.subscription ?? null) !== next.hasActiveSubscription) {
      clearCourseMemory();
      invalidateApiCache();
    }
    userRef.current = next;
    setUserState(next);
    void persistUser(next);
    return next;
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [token, persisted] = await Promise.all([getAccessToken(), loadPersistedUser()]);
        if (cancelled) return;
        if (persisted) {
          userRef.current = persisted;
          setUserState(persisted);
        }
        setIsReady(true);
        if (!token) return;

        lastRefreshAt.current = Date.now();
        const [me, current] = await Promise.all([
          fetchCurrentUser().catch(() => null),
          getCurrentSubscription(),
        ]);
        if (cancelled) return;
        if (!me && !userRef.current) {
          userRef.current = null;
          setUserState(null);
          return;
        }
        if (!me) {
          const stillHasToken = await getAccessToken();
          if (!stillHasToken) {
            userRef.current = null;
            setUserState(null);
            return;
          }
        }
        mergeSession({ me: me || undefined, current, keepExistingActive: false });
      } catch {
        if (!cancelled && !userRef.current) {
          userRef.current = null;
          setUserState(null);
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mergeSession]);

  const login = useCallback(async (input: { email: string; password: string }) => {
    invalidateApiCache();
    clearCourseMemory();
    const current = await loginUser(input);
    userRef.current = current;
    lastRefreshAt.current = Date.now();
    setUserState(current);
    return current;
  }, []);

  const register = useCallback(async (input: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    state?: string;
  }) => {
    invalidateApiCache();
    clearCourseMemory();
    const current = await registerUser(input);
    userRef.current = current;
    lastRefreshAt.current = Date.now();
    setUserState(current);
    return current;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    invalidateApiCache();
    clearCourseMemory();
    userRef.current = null;
    lastRefreshAt.current = 0;
    setUserState(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    await deleteAccountRequest();
    invalidateApiCache();
    clearCourseMemory();
    userRef.current = null;
    lastRefreshAt.current = 0;
    setUserState(null);
  }, []);

  const applySubscription = useCallback((input: { hasActiveSubscription?: boolean; subscription?: Subscription | null }) => {
    const prev = userRef.current;
    if (!prev) return;
    const subscription = input.subscription !== undefined ? input.subscription : prev.subscription;
    const next = {
      ...prev,
      subscription,
      hasActiveSubscription: isActiveSubscription(
        input.hasActiveSubscription ?? Boolean(subscription) ?? prev.hasActiveSubscription,
        subscription ?? null,
      ),
    };
    userRef.current = next;
    setUserState(next);
    clearCourseMemory();
    invalidateApiCache();
    lastRefreshAt.current = 0;
    void persistUser(next);
  }, []);

  const refreshUser = useCallback(async (options?: { force?: boolean }) => {
    if (!options?.force && userRef.current && Date.now() - lastRefreshAt.current < 30_000) {
      return userRef.current;
    }
    lastRefreshAt.current = Date.now();
    const [me, current] = await Promise.all([
      fetchCurrentUser().catch(() => null),
      getCurrentSubscription(),
    ]);
    return mergeSession({ me: me || undefined, current, keepExistingActive: true });
  }, [mergeSession]);

  const subscription = user?.subscription ?? null;
  const hasActiveSubscription = isActiveSubscription(user?.hasActiveSubscription, subscription);

  const value = useMemo(
    () => ({
      user,
      isReady,
      isLoggedIn: Boolean(user),
      hasActiveSubscription,
      subscription,
      login,
      register,
      logout,
      deleteAccount,
      refreshUser,
      applySubscription,
      setUser,
    }),
    [user, isReady, hasActiveSubscription, subscription, login, register, logout, deleteAccount, refreshUser, applySubscription, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
