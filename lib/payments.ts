import { api, asList } from './api';

export type PlanRecord = {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: number;
  features: string[];
};

export type CheckoutOrder = {
  planId: string;
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  name?: string;
};

export type Subscription = {
  id?: string;
  planId?: string;
  planName?: string;
  name?: string;
  status?: string;
  expiresAt?: string;
  endDate?: string;
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

export async function listPlans() {
  return asList<Record<string, any>>(await api.get('/api/plans'));
}

export async function createPaymentOrder(planId: string): Promise<CheckoutOrder> {
  const data = (await api.post<Record<string, any>>('/api/payments/create-order', { planId })) || {};
  const order = data.order || data;
  const amountRaw = Number(order.amount ?? data.amount ?? 0);
  const amount = amountRaw > 100000 ? amountRaw : amountRaw > 1000 && amountRaw % 100 === 0 ? amountRaw : Math.round(amountRaw * (amountRaw < 1000 ? 100 : 1));

  return {
    planId,
    orderId: firstString(order, ['id', 'orderId']) || firstString(data, ['orderId', 'id']),
    razorpayOrderId: firstString(order, ['razorpayOrderId', 'id', 'orderId']) || firstString(data, ['razorpayOrderId', 'orderId']),
    amount: Number(order.amount ?? data.amount ?? amount),
    currency: firstString(order, ['currency'], firstString(data, ['currency'], 'INR')),
    keyId: firstString(data, ['keyId', 'key', 'razorpayKeyId', 'razorpayKey'], firstString(order, ['keyId', 'key'])),
    name: firstString(data, ['name', 'planName']),
  };
}

export async function verifyPayment(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  return api.post('/api/payments/verify', input);
}

export async function getCurrentSubscription() {
  try {
    const data = await api.get<Subscription | null>('/api/subscriptions/current');
    if (!data || (typeof data === 'object' && !Object.keys(data).length)) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getPaymentHistory() {
  return asList<PaymentRecord>(await api.get('/api/payments/history'));
}
