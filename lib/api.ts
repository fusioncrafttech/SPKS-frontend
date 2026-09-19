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
  const production = 'https://spks-exams-backend.vercel.app';
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  const url = fromEnv || production;
  const lanHost = expoLanHost();
  if (lanHost && /localhost|127\.0\.0\.1/.test(url)) {
    return url.replace(/localhost|127\.0\.0\.1/g, lanHost);
  }
  return url;
}

function isFormDataBody(body: unknown): body is FormData {
  return Boolean(body && typeof body === 'object' && typeof (body as FormData).append === 'function');
}

function requestHeaders(options: RequestInit, accessToken: string | null) {
  const headers: Record<string, string> = {};
  const incoming = options.headers;
  if (incoming instanceof Headers) {
    incoming.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (Array.isArray(incoming)) {
    incoming.forEach(([key, value]) => {
      headers[key] = value;
    });
  } else if (incoming) {
    Object.entries(incoming).forEach(([key, value]) => {
      if (value != null) headers[key] = String(value);
    });
  }
  if (!isFormDataBody(options.body) && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (isFormDataBody(options.body)) {
    delete headers['Content-Type'];
    delete headers['content-type'];
  }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

function networkError(error?: unknown, kind: 'upload' | 'request' = 'request') {
  const detail = error instanceof Error ? error.message : '';
  if (kind === 'upload') {
    if (/timeout/i.test(detail)) {
      return new ApiError('Photo upload timed out. Try a smaller image.', 0);
    }
    return new ApiError('Could not upload the photo. Check your internet and try a smaller image.', 0);
  }
  return new ApiError('Cannot reach the server. Check your internet connection.', 0);
}

async function sendFormData(url: string, formData: FormData, headers: Record<string, string>) {
  if (Platform.OS === 'web') {
    return fetch(url, { method: 'POST', headers, body: formData });
  }

  return new Promise<Response>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    Object.entries(headers).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'content-type') xhr.setRequestHeader(key, value);
    });
    xhr.timeout = 60_000;
    xhr.onload = () => {
      resolve(
        new Response(xhr.responseText, {
          status: xhr.status,
          headers: { 'Content-Type': xhr.getResponseHeader('Content-Type') || 'application/json' },
        }),
      );
    };
    xhr.onerror = () => reject(new TypeError('Network request failed'));
    xhr.ontimeout = () => reject(new Error('timeout'));
    xhr.send(formData);
  });
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
  const headers = requestHeaders(options, accessToken);

  let response: Response;
  try {
    response = isFormDataBody(options.body)
      ? await sendFormData(url, options.body, headers)
      : await fetch(url, { ...options, headers });
  } catch (error) {
    if (isAbortError(error) || options.signal?.aborted) throw error;
    throw networkError(error, isFormDataBody(options.body) ? 'upload' : 'request');
  }

  if (response.status === 401 && retry && (await refreshAccessToken())) {
    return apiFetch(pathOrUrl, options, false);
  }

  return response;
}

async function sendApiRequest<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const accessToken = await getAccessToken();
  const headers = requestHeaders(options, accessToken);

  let response: Response;
  try {
    response = isFormDataBody(options.body)
      ? await sendFormData(`${API_URL}${path}`, options.body, headers)
      : await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (error) {
    if (isAbortError(error) || options.signal?.aborted) throw error;
    throw networkError(error, isFormDataBody(options.body) ? 'upload' : 'request');
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
  upload: async <T>(path: string, file: { uri: string; name?: string; type?: string }, fieldName = 'file') => {
    const name = file.name || 'profile-image.jpg';
    const type = file.type && file.type !== 'image/jpg' ? file.type : 'image/jpeg';
    const formData = new FormData();
    if (Platform.OS === 'web') {
      const blob = await (await fetch(file.uri)).blob();
      formData.append(fieldName, blob, name);
    } else {
      formData.append(fieldName, {
        uri: file.uri,
        name,
        type,
      } as unknown as Blob);
    }
    return apiRequest<T>(path, { method: 'POST', body: formData });
  },
};
