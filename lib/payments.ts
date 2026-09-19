import { api, asList } from './api';

export type PlanRecord = {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: number;
  interval?: string;
  features: string[];
};

export type CheckoutOrder = {
  planId: string;
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
};

export type Subscription = {
  id?: string;
  planId?: string;
  planName?: string;
  name?: string;
  status?: string;
  startsAt?: string;
  endsAt?: string;
  expiresAt?: string;
  endDate?: string;
  daysRemaining?: number;
};

export type PaymentRecord = {
  id: string;
  amount?: number;
  currency?: string;
  status?: string;
  planName?: string;
  createdAt?: string;
};

function firstString(value: Record<string, any>, keys: string[], fallback = '') {
  for (const key of keys) {
    if (value[key] !== undefined && value[key] !== null && value[key] !== '') {
      return String(value[key]);
    }
  }
  return fallback;
}

function parseFeatures(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

export function mapPlan(plan: Record<string, any>): PlanRecord {
  return {
    id: String(plan.id),
    name: String(plan.name || 'Plan'),
    price: Number(plan.price ?? plan.amount ?? 0),
    currency: String(plan.currency || 'INR'),
    duration: Number(plan.duration ?? plan.durationDays ?? 0),
    interval: plan.interval ? String(plan.interval) : undefined,
    features: parseFeatures(plan.features),
  };
}

export function mapSubscription(value: unknown): Subscription | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, any>;
  if (!Object.keys(item).length) return null;
  const planName = item.planName || item.plan?.name || item.name;
  const endsAt = item.endsAt || item.expiresAt || item.endDate;
  const daysRemaining = item.daysRemaining ?? item.daysLeft;
  return {
    id: item.id ? String(item.id) : undefined,
    planId: item.planId || item.plan?.id ? String(item.planId || item.plan?.id) : undefined,
    planName,
    name: planName,
    status: item.status,
    startsAt: item.startsAt || item.startDate,
    endsAt,
    expiresAt: item.expiresAt,
    endDate: item.endDate,
    daysRemaining: daysRemaining === undefined || daysRemaining === null ? undefined : Number(daysRemaining),
  };
}

export function subscriptionEndsAt(subscription?: Subscription | null) {
  return subscription?.endsAt || subscription?.expiresAt || subscription?.endDate || '';
}

export function formatSubscriptionDate(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function isActiveSubscription(hasActive?: boolean | null, subscription?: Subscription | null) {
  const endsAt = subscriptionEndsAt(subscription);
  if (endsAt && new Date(endsAt).getTime() <= Date.now()) return false;
  if (hasActive === false) return false;
  if (hasActive) return true;
  if (subscription?.status && /expired|cancelled|canceled|inactive/i.test(subscription.status)) return false;
  if (subscription?.status && /active|paid|success/i.test(subscription.status)) return true;
  return Boolean(endsAt);
}

export async function listPlans() {
  return asList<Record<string, any>>(await api.get('/api/plans'))
    .filter((plan) => plan?.id && plan.isActive !== false && plan.active !== false)
    .map(mapPlan)
    .filter((plan) => plan.price > 0);
}

export async function getPaymentConfig() {
  try {
    return await api.get<{ keyId?: string; currency?: string; configured?: boolean }>('/api/payments/config');
  } catch {
    return null;
  }
}

export async function createPaymentOrder(planId: string): Promise<CheckoutOrder> {
  const data = (await api.post<Record<string, any>>('/api/payments/create-order', { planId })) || {};
  const order = data.order && typeof data.order === 'object' ? data.order : data;
  const plan = data.plan && typeof data.plan === 'object' ? data.plan : {};

  return {
    planId: firstString(plan, ['id'], planId),
    keyId: firstString(data, ['keyId', 'key', 'razorpayKeyId']) || firstString(order, ['keyId', 'key']),
    orderId: firstString(data, ['orderId', 'razorpayOrderId']) || firstString(order, ['orderId', 'razorpayOrderId', 'id']),
    amount: Number(data.amount ?? order.amount ?? 0),
    currency: firstString(data, ['currency'], firstString(order, ['currency'], 'INR')),
    name: firstString(data, ['name'], firstString(plan, ['name'], 'SPKS Exams')),
    description: firstString(data, ['description'], firstString(plan, ['name', 'description'])),
  };
}

export async function verifyPayment(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const data = (await api.post<Record<string, any>>('/api/payments/verify', input)) || {};
  const subscription = mapSubscription(data.subscription) || (data.endsAt ? mapSubscription(data) : null);
  return {
    hasActiveSubscription: Boolean(data.hasActiveSubscription ?? subscription),
    subscription,
    raw: data,
  };
}

export async function getCurrentSubscription() {
  try {
    const data = await api.get<Record<string, any> | null>('/api/subscriptions/current');
    if (!data) return null;
    const nested = data.subscription && typeof data.subscription === 'object' ? data.subscription : data;
    return mapSubscription(nested);
  } catch {
    return null;
  }
}

export async function getPaymentHistory() {
  return asList<PaymentRecord>(await api.get('/api/payments/history'));
}
