import AsyncStorage from '@react-native-async-storage/async-storage';

import { api, clearTokens, getRefreshToken, setTokens } from './api';
import { isActiveSubscription, mapSubscription, type Subscription } from './payments';

const USER_PROFILE_KEY = 'userProfile';
let lastPersistedUserJson = '';

export type AuthUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  profileImage?: string | null;
  state?: string | null;
  role?: string;
  status?: string;
  hasActiveSubscription?: boolean;
  subscription?: Subscription | null;
};

type AuthPayload = {
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  hasActiveSubscription?: boolean;
  subscription?: Subscription | null;
};

export function mapProfile(user: AuthUser | null | undefined) {
  if (!user) return null;
  return {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    profileImage: user.profileImage || null,
    state: user.state || null,
  };
}

export async function persistUser(user: AuthUser | null) {
  if (!user) {
    lastPersistedUserJson = '';
    await AsyncStorage.removeItem(USER_PROFILE_KEY);
    return;
  }
  const next = JSON.stringify(user);
  if (next === lastPersistedUserJson) return;
  lastPersistedUserJson = next;
  await AsyncStorage.setItem(USER_PROFILE_KEY, next);
}

export async function loadPersistedUser(): Promise<AuthUser | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_PROFILE_KEY);
    if (!raw) return null;
    lastPersistedUserJson = raw;
    const parsed = JSON.parse(raw) as AuthUser;
    return normalizeAuthUser(parsed) || (parsed.email || parsed.firstName ? parsed : null);
  } catch {
    return null;
  }
}

function asRecord(value: unknown): Record<string, any> | null {
  return value && typeof value === 'object' ? (value as Record<string, any>) : null;
}

export function normalizeAuthUser(payload: unknown): AuthUser | null {
  const data = asRecord(payload);
  if (!data) return null;
  const nested = asRecord(data.user);
  const user = nested?.id || nested?.email ? nested : data.id || data.email ? data : nested;
  if (!user) return null;

  const subscription = mapSubscription(
    data.subscription !== undefined ? data.subscription : user.subscription,
  );
  const hasActive = data.hasActiveSubscription ?? user.hasActiveSubscription;

  return {
    ...user,
    id: String(user.id || ''),
    hasActiveSubscription: isActiveSubscription(hasActive, subscription),
    subscription,
  };
}

function requireTokens(payload: AuthPayload) {
  if (!payload?.accessToken) {
    throw new Error('Login did not return an access token');
  }
  return payload;
}

async function completeAuth(payload: AuthPayload) {
  const tokens = requireTokens(payload);
  await setTokens(tokens.accessToken!, tokens.refreshToken);
  const user = normalizeAuthUser(tokens) || (await fetchCurrentUser());
  if (!user) throw new Error('Could not load your account.');
  await persistUser(user);
  return user;
}

export async function registerUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  state?: string;
}) {
  const payload = await api.post<AuthPayload>('/api/auth/register', {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone || undefined,
    password: input.password,
    state: input.state || undefined,
  });
  return completeAuth(payload);
}

export async function loginUser(input: { email: string; password: string }) {
  const payload = await api.post<AuthPayload>('/api/auth/login', {
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });
  return completeAuth(payload);
}

export async function fetchCurrentUser() {
  const user = normalizeAuthUser(await api.get<AuthUser>('/api/auth/me'));
  if (!user) throw new Error('Could not load your account.');
  await persistUser(user);
  return user;
}

export async function logoutUser() {
  const refreshToken = await getRefreshToken();
  try {
    await api.post('/api/auth/logout', refreshToken ? { refreshToken } : undefined);
  } catch {
    // Clear local session even if the network call fails.
  } finally {
    await clearTokens();
    await persistUser(null);
  }
}

export async function forgotPassword(email: string) {
  return api.post('/api/auth/forgot-password', { email: email.trim().toLowerCase() });
}

export async function updateProfile(input: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  state?: string;
}) {
  await api.patch('/api/users/me', input);
  return fetchCurrentUser();
}

export async function uploadProfileImage(file: { uri: string; name?: string; type?: string }) {
  await api.upload('/api/users/me/profile-image', file, 'profileImage');
  return fetchCurrentUser();
}

export async function deleteProfileImage() {
  await api.delete('/api/users/me/profile-image');
  return fetchCurrentUser();
}

export async function changePassword(input: { currentPassword: string; newPassword: string }) {
  return api.post('/api/auth/change-password', input);
}

export async function resetPassword(input: { token: string; password: string }) {
  return api.post('/api/auth/reset-password', input);
}

export async function deleteAccount() {
  await api.delete('/api/users/me/account');
  await clearTokens();
  await persistUser(null);
}
