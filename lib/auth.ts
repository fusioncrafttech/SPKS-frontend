import AsyncStorage from '@react-native-async-storage/async-storage';

import { api, clearTokens, getRefreshToken, setTokens } from './api';

export const USER_PROFILE_KEY = 'userProfile';

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
};

type AuthPayload = {
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
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
    await AsyncStorage.removeItem(USER_PROFILE_KEY);
    return;
  }
  await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(mapProfile(user)));
}

function requireTokens(payload: AuthPayload) {
  if (!payload?.accessToken) {
    throw new Error('Login did not return an access token');
  }
  return payload;
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
  const tokens = requireTokens(payload);
  await setTokens(tokens.accessToken!, tokens.refreshToken);
  const user = tokens.user || (await api.get<AuthUser>('/api/auth/me'));
  await persistUser(user);
  return user;
}

export async function loginUser(input: { email: string; password: string }) {
  const payload = await api.post<AuthPayload>('/api/auth/login', {
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });
  const tokens = requireTokens(payload);
  await setTokens(tokens.accessToken!, tokens.refreshToken);
  const user = tokens.user || (await api.get<AuthUser>('/api/auth/me'));
  await persistUser(user);
  return user;
}

export async function fetchCurrentUser() {
  const user = await api.get<AuthUser>('/api/auth/me');
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
  const user = await api.patch<AuthUser>('/api/users/me', input);
  await persistUser(user);
  return user;
}

export async function uploadProfileImage(file: { uri: string; name?: string; type?: string }) {
  const user = await api.upload<AuthUser>('/api/users/me/profile-image', file, 'profileImage');
  await persistUser(user);
  return user;
}
