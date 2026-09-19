import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'spks_access_token';
const REFRESH_TOKEN_KEY = 'spks_refresh_token';
const GET_CACHE_TTL_MS = 45_000;

let memoryAccessToken: string | null | undefined;
const getCache = new Map<string, { expiresAt: number; value: unknown }>();
const inflightGets = new Map<string, Promise<unknown>>();

function requestMethod(options: RequestInit = {}) {
  return (options.method || 'GET').toUpperCase();
}

function shouldInvalidateCache(path: string, method: string) {
  if (method === 'GET' || method === 'HEAD') return false;
  return !/\/(answers|progress|complete|view)(\?|$)/.test(path);
}

export function invalidateApiCache() {
  getCache.clear();
  inflightGets.clear();
}

function isAbortError(error: unknown) {
  return (
    (typeof DOMException !== 'undefined' && error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  );
}

function expoLanHost() {
  const hostUri = Constants.expoConfig?.hostUri || Constants.linkingUri || '';
  const host = hostUri.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') return host;
  return null;
}

function defaultApiUrl() {
  const fallback = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') || fallback;
  const lanHost = expoLanHost();
  if (lanHost && /localhost|127\.0\.0\.1/.test(fromEnv)) {
    return fromEnv.replace(/localhost|127\.0\.0\.1/g, lanHost);
  }
  return fromEnv;
}

export const API_URL = defaultApiUrl();

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number };
  errors?: { field?: string; message?: string }[];
  code?: string;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.code = code;
  }
}

type QueryValue = string | number | boolean | null | undefined;

export function withQuery(path: string, query?: Record<string, QueryValue>) {
  if (!query) return path;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function asList<T>(value: T[] | { items?: T[] } | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && Array.isArray(value.items)) return value.items;
  return [];
}

export async function setTokens(accessToken: string, refreshToken?: string) {
  memoryAccessToken = accessToken;
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export async function clearTokens() {
  memoryAccessToken = null;
  invalidateApiCache();
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
}

export async function getAccessToken() {
  if (memoryAccessToken !== undefined) return memoryAccessToken;
  memoryAccessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  return memoryAccessToken;
}

export async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

function errorMessageFromPayload(payload: ApiResponse<unknown> | undefined, fallback: string) {
  const fieldErrors = payload?.errors?.map((item) => item.message).filter(Boolean);
  if (fieldErrors?.length) return fieldErrors.join('\n');
  if (payload?.message) return payload.message;
  return fallback;
}

async function refreshAccessToken() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    await clearTokens();
    return false;
  }

  const payload = (await response.json()) as ApiResponse<{ accessToken?: string; refreshToken?: string }>;
  const accessToken = payload.data?.accessToken;
  if (!accessToken) {
    await clearTokens();
    return false;
  }

  await setTokens(accessToken, payload.data?.refreshToken);
  return true;
}

function getPayload<T>(payload: ApiResponse<T> | T | undefined): T {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return (payload as ApiResponse<T>).data as T;
  }
  return payload as T;
}

export function toAbsoluteApiUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return '';
  const value = String(pathOrUrl).trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_URL}${value.startsWith('/') ? value : `/${value}`}`;
}

export async function apiFetch(pathOrUrl: string, options: RequestInit = {}, retry = true): Promise<Response> {
  const url = toAbsoluteApiUrl(pathOrUrl) || pathOrUrl;
  const accessToken = await getAccessToken();
  const headers = new Headers(options.headers);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (error) {
    if (isAbortError(error) || options.signal?.aborted) throw error;
    throw new ApiError('Cannot reach the server. Check that the backend is running and EXPO_PUBLIC_API_URL is set.', 0);
  }

  if (response.status === 401 && retry && (await refreshAccessToken())) {
    return apiFetch(pathOrUrl, options, false);
  }

  return response;
}

async function sendApiRequest<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const accessToken = await getAccessToken();
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  }
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (error) {
    if (isAbortError(error) || options.signal?.aborted) throw error;
    throw new ApiError('Cannot reach the server. Check that the backend is running and EXPO_PUBLIC_API_URL is set.', 0);
  }

  if (response.status === 401 && retry && (await refreshAccessToken())) {
    return sendApiRequest<T>(path, options, false);
  }

  const text = await response.text();
  let payload: ApiResponse<T> | T | undefined;
  try {
    payload = text ? JSON.parse(text) : undefined;
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    const apiPayload = payload as ApiResponse<T> | undefined;
    throw new ApiError(
      errorMessageFromPayload(apiPayload, `Request failed with status ${response.status}`),
      response.status,
      payload,
      apiPayload?.code,
    );
  }

  const result = getPayload(payload as ApiResponse<T> | T);
  const method = requestMethod(options);
  if (method === 'GET') {
    getCache.set(`GET:${path}`, { value: result, expiresAt: Date.now() + GET_CACHE_TTL_MS });
  } else if (shouldInvalidateCache(path, method)) {
    invalidateApiCache();
  }
  return result;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const method = requestMethod(options);
  const cacheKey = `${method}:${path}`;

  if (method === 'GET' && retry) {
    const cached = getCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T;
    }
    const pending = inflightGets.get(cacheKey);
    if (pending) return pending as Promise<T>;
  }

  const request = sendApiRequest<T>(path, options, retry);
  if (method !== 'GET' || !retry) return request;

  inflightGets.set(cacheKey, request);
  try {
    return await request;
  } finally {
    inflightGets.delete(cacheKey);
  }
}

export const api = {
  get: <T>(path: string, query?: Record<string, QueryValue>) => apiRequest<T>(withQuery(path, query)),
  post: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: 'PATCH', body: body === undefined ? undefined : JSON.stringify(body) }),
  delete: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: 'DELETE', body: body === undefined ? undefined : JSON.stringify(body) }),
  upload: <T>(path: string, file: { uri: string; name?: string; type?: string }, fieldName = 'file') => {
    const formData = new FormData();
    formData.append(fieldName, {
      uri: file.uri,
      name: file.name || 'upload.jpg',
      type: file.type || 'image/jpeg',
    } as unknown as Blob);
    return apiRequest<T>(path, { method: 'POST', body: formData });
  },
};
