import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { getAccessToken } from '@/lib/api';
import {
  AuthUser,
  fetchCurrentUser,
  loginUser,
  logoutUser,
  persistUser,
  registerUser,
} from '@/lib/auth';
import { getCurrentSubscription, isActiveSubscription, type Subscription } from '@/lib/payments';

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
  refreshUser: () => Promise<AuthUser | null>;
  applySubscription: (input: { hasActiveSubscription?: boolean; subscription?: Subscription | null }) => void;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const userRef = useRef<AuthUser | null>(null);

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
    userRef.current = next;
    setUserState(next);
    void persistUser(next);
    return next;
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const me = await fetchCurrentUser();
        const current = await getCurrentSubscription();
        if (cancelled) return;
        mergeSession({ me, current, keepExistingActive: false });
      } catch {
        if (!cancelled) {
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
    const current = await loginUser(input);
    userRef.current = current;
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
    const current = await registerUser(input);
    userRef.current = current;
    setUserState(current);
    return current;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    userRef.current = null;
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
    void persistUser(next);
  }, []);

  const refreshUser = useCallback(async () => {
    let me: AuthUser | null = null;
    try {
      me = await fetchCurrentUser();
    } catch {
      me = null;
    }
    const current = await getCurrentSubscription();
    return mergeSession({ me, current, keepExistingActive: true });
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
      refreshUser,
      applySubscription,
      setUser,
    }),
    [user, isReady, hasActiveSubscription, subscription, login, register, logout, refreshUser, applySubscription, setUser],
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
