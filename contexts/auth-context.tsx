import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getAccessToken } from '@/lib/api';
import {
  AuthUser,
  fetchCurrentUser,
  loginUser,
  logoutUser,
  persistUser,
  registerUser,
} from '@/lib/auth';

type AuthContextType = {
  user: AuthUser | null;
  isReady: boolean;
  isLoggedIn: boolean;
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
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  const setUser = useCallback((next: AuthUser | null) => {
    setUserState(next);
    void persistUser(next);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const current = await fetchCurrentUser();
        if (!cancelled) setUserState(current);
      } catch {
        if (!cancelled) setUserState(null);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: { email: string; password: string }) => {
    const current = await loginUser(input);
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
    setUserState(current);
    return current;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUserState(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const current = await fetchCurrentUser();
      setUserState(current);
      return current;
    } catch {
      setUserState(null);
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isReady,
      isLoggedIn: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [user, isReady, login, register, logout, refreshUser, setUser],
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
