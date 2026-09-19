import { Alert } from 'react-native';
import { router } from 'expo-router';

import { ApiError } from './api';

export function postAuthHref(hasActiveSubscription: boolean) {
  return hasActiveSubscription ? '/(tabs)' : '/(tabs)/price';
}

export function sendToPlans() {
  router.push('/(tabs)/price');
}

function errorCode(error: ApiError) {
  if (error.code) return error.code;
  const details = error.details as Record<string, unknown> | undefined;
  if (!details || typeof details !== 'object') return undefined;
  if (typeof details.code === 'string') return details.code;
  const nested = details.data;
  if (nested && typeof nested === 'object' && typeof (nested as { code?: string }).code === 'string') {
    return (nested as { code?: string }).code;
  }
  return undefined;
}

export function isPremiumRequired(error: unknown) {
  if (!(error instanceof ApiError)) return false;
  if (errorCode(error) === 'PREMIUM_REQUIRED') return true;
  return error.status === 403 && /active plan is required|PREMIUM_REQUIRED/i.test(error.message || '');
}

export function promptPremium(message?: string) {
  Alert.alert(
    'Plan required',
    message || 'An active plan is required to open courses. Choose 1 month, 6 months, or 1 year.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'View plans', onPress: sendToPlans },
    ],
  );
}

export function handlePremiumError(error: unknown, message?: string) {
  if (!isPremiumRequired(error)) return false;
  const fallback = error instanceof Error ? error.message : undefined;
  Alert.alert(
    'Plan required',
    message || fallback || 'An active plan is required to open courses.',
    [{ text: 'View plans', onPress: () => router.replace('/(tabs)/price') }],
  );
  return true;
}
