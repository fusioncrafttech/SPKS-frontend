import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { useTheme } from '@/contexts/theme-context';
import { api, asList } from '@/lib/api';
import { createPaymentOrder, getCurrentSubscription, type Subscription } from '@/lib/payments';

type Plan = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  durationDays: number;
  features: string[];
};

function formatAmount(value: number) {
  return value.toLocaleString('en-IN');
}

function periodCopy(plan: Plan) {
  if (plan.amount === 0 || plan.durationDays === 0) {
    return { line: 'Free forever', hint: 'No payment needed' };
  }
  if (plan.durationDays <= 31) {
    return { line: 'per month', hint: 'Billed every 30 days' };
  }
  if (plan.durationDays >= 300) {
    const monthly = Math.round(plan.amount / 12);
    return { line: 'per year', hint: `About ₹${formatAmount(monthly)} per month` };
  }
  return { line: `for ${plan.durationDays} days`, hint: 'One-time access' };
}

function isMonthly(plan: Plan) {
  return plan.durationDays > 0 && plan.durationDays <= 31;
}

function parseFeatures(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

const FALLBACK_PLANS: Plan[] = [
  { id: '1', name: 'Free', amount: 0, currency: 'INR', durationDays: 0, features: ['Limited tests', 'Daily current affairs'] },
  { id: '2', name: 'Monthly', amount: 299, currency: 'INR', durationDays: 30, features: ['All courses', 'Unlimited tests', 'Premium notes'] },
  { id: '3', name: 'Yearly', amount: 2499, currency: 'INR', durationDays: 365, features: ['All courses', 'Unlimited tests', 'Premium notes', 'Priority support'] },
];

export default function PriceScreen() {
  const { colors, isDark } = useTheme();
  const [pricingPlans, setPricingPlans] = useState(FALLBACK_PLANS);
  const [selectedId, setSelectedId] = useState(FALLBACK_PLANS[1].id);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    api.get<Record<string, any>[]>('/api/plans')
      .then((items) => {
        const list = asList(items);
        if (!list.length) return;
        const next = list.map((plan) => ({
          id: String(plan.id),
          name: plan.name || 'Plan',
          amount: Number(plan.price) || 0,
          currency: String(plan.currency || 'INR'),
          durationDays: Number(plan.duration) || 0,
          features: parseFeatures(plan.features).length ? parseFeatures(plan.features) : ['Course access'],
        }));
        setPricingPlans(next);
        const monthly = next.find(isMonthly);
        setSelectedId(monthly?.id || next[0]?.id);
      })
      .catch(() => undefined);
    getCurrentSubscription().then(setSubscription);
  }, []);

  const selected = useMemo(
    () => pricingPlans.find((plan) => plan.id === selectedId) || pricingPlans[0],
    [pricingPlans, selectedId]
  );

  const handleGetStarted = async (plan: Plan) => {
    if (plan.amount === 0) {
      Alert.alert('Free plan', 'You already have access to the free plan.');
      return;
    }
    setPaying(true);
    try {
      const order = await createPaymentOrder(plan.id);
      const keyId = order.keyId || process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '';
      if (!keyId || !order.razorpayOrderId) {
        Alert.alert('Payment', 'Checkout is not configured yet. The order was created on the server.');
        return;
      }
      const amount = order.amount > 0 && order.amount < 5000 ? Math.round(order.amount * 100) : order.amount;
      router.push({
        pathname: '/checkout',
        params: {
          keyId,
          orderId: order.razorpayOrderId,
          amount: String(amount),
          currency: order.currency || 'INR',
          name: plan.name,
        },
      } as any);
    } catch (error) {
      Alert.alert('Payment', error instanceof Error ? error.message : 'Payment is not available yet.');
    } finally {
      setPaying(false);
    }
  };

  const ctaLabel = selected?.amount === 0
    ? 'Continue with Free'
    : `Continue · ₹${formatAmount(selected?.amount || 0)}`;

  return (
    <Screen>
      <ScreenScroll contentStyle={{ paddingTop: 8 }}>
        <ThemedText style={[styles.kicker, { color: colors.textSecondary }]}>Membership</ThemedText>
        <ThemedText style={[styles.pageTitle, { color: colors.text }]}>Pick a plan</ThemedText>
        <ThemedText style={[styles.pageHint, { color: colors.textSecondary }]}>
          Monthly billing, or save more with a yearly plan
        </ThemedText>

        {subscription?.planName || subscription?.name ? (
          <View style={[styles.currentPlan, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.currentLabel, { color: colors.textSecondary }]}>You are on</ThemedText>
            <ThemedText style={[styles.currentName, { color: colors.text }]}>
              {subscription.planName || subscription.name}
            </ThemedText>
          </View>
        ) : null}

        {pricingPlans.map((plan) => {
          const selectedPlan = plan.id === selectedId;
          const copy = periodCopy(plan);
          const highlight = isMonthly(plan);

          return (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                {
                  borderColor: selectedPlan ? '#4338CA' : colors.border,
                  backgroundColor: selectedPlan
                    ? isDark
                      ? '#1E1B4B'
                      : '#E0E7FF'
                    : colors.card,
                },
              ]}
              onPress={() => setSelectedId(plan.id)}
              activeOpacity={0.9}
            >
              <View style={styles.planTop}>
                <View style={styles.planIdentity}>
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: selectedPlan ? '#4338CA' : colors.textMuted,
                        backgroundColor: selectedPlan ? '#4338CA' : 'transparent',
                      },
                    ]}
                  >
                    {selectedPlan ? <View style={styles.radioDot} /> : null}
                  </View>
                  <ThemedText style={[styles.planName, { color: selectedPlan && isDark ? '#FFFFFF' : colors.text }]}>
                    {plan.name}
                  </ThemedText>
                </View>
                {highlight ? (
                  <View style={styles.bestChip}>
                    <ThemedText style={styles.bestChipText}>Best value</ThemedText>
                  </View>
                ) : null}
              </View>

              <View style={styles.priceBlock}>
                {plan.amount === 0 ? (
                  <Text style={[styles.freeLabel, { color: selectedPlan && isDark ? '#FFFFFF' : colors.text }]}>
                    Free
                  </Text>
                ) : (
                  <View style={styles.amountRow}>
                    <Text style={[styles.currency, { color: selectedPlan && isDark ? '#C7D2FE' : colors.textSecondary }]}>
                      ₹
                    </Text>
                    <Text
                      style={[styles.amount, { color: selectedPlan && isDark ? '#FFFFFF' : colors.text }]}
                      numberOfLines={1}
                    >
                      {formatAmount(plan.amount)}
                    </Text>
                  </View>
                )}
                <Text style={[styles.period, { color: selectedPlan && isDark ? '#C7D2FE' : colors.textSecondary }]}>
                  {copy.line}
                </Text>
                <Text style={[styles.periodHint, { color: selectedPlan && isDark ? '#A5B4FC' : colors.textMuted }]}>
                  {copy.hint}
                </Text>
              </View>

              {plan.features.map((feature) => (
                <View key={feature} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={16} color={selectedPlan ? '#4338CA' : colors.tint} />
                  <ThemedText style={[styles.featureText, { color: selectedPlan && isDark ? '#E0E7FF' : colors.text }]}>
                    {feature}
                  </ThemedText>
                </View>
              ))}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={styles.cta}
          onPress={() => selected && handleGetStarted(selected)}
          activeOpacity={0.88}
          disabled={paying}
        >
          <ThemedText style={styles.ctaText}>{paying ? 'Opening checkout...' : ctaLabel}</ThemedText>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/profile/payments' as any)} style={{ alignItems: 'center', marginTop: 16 }}>
          <ThemedText style={{ color: colors.tint, fontWeight: '700' }}>View payment history</ThemedText>
        </TouchableOpacity>

        <View style={styles.perkRow}>
          <ThemedText style={[styles.perk, { color: colors.textMuted }]}>Secure payment</ThemedText>
          <ThemedText style={[styles.perkDot, { color: colors.textMuted }]}>·</ThemedText>
          <ThemedText style={[styles.perk, { color: colors.textMuted }]}>Cancel anytime</ThemedText>
        </View>
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  pageHint: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  currentPlan: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  currentLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  currentName: {
    fontSize: 18,
    fontWeight: '800',
  },
  planCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
  },
  planTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  planIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  planName: {
    fontSize: 16,
    fontWeight: '800',
  },
  bestChip: {
    backgroundColor: '#4338CA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  bestChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  priceBlock: {
    marginBottom: 12,
    paddingLeft: 32,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  currency: {
    fontSize: 20,
    lineHeight: 34,
    fontWeight: '700',
    marginRight: 4,
    includeFontPadding: false,
  },
  amount: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.8,
    includeFontPadding: false,
  },
  freeLabel: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.8,
    includeFontPadding: false,
  },
  period: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  periodHint: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 32,
    marginBottom: 6,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cta: {
    marginTop: 8,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#4338CA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  perkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  perk: {
    fontSize: 12,
    fontWeight: '600',
  },
  perkDot: {
    fontSize: 12,
  },
});
