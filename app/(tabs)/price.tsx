import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { ApiError } from '@/lib/api';
import {
  createPaymentOrder,
  formatSubscriptionDate,
  getCurrentSubscription,
  getPaymentConfig,
  listPlans,
  subscriptionEndsAt,
  type PlanRecord,
  type Subscription,
} from '@/lib/payments';

type Plan = PlanRecord;

function formatAmount(value: number) {
  return value.toLocaleString('en-IN');
}

function periodCopy(plan: Plan) {
  const interval = (plan.interval || '').toLowerCase();
  if (interval === '1_month' || (plan.duration > 0 && plan.duration <= 31)) {
    return { line: 'for 1 month', hint: '30 days of course access' };
  }
  if (interval === '6_months' || (plan.duration >= 150 && plan.duration < 300)) {
    return { line: 'for 6 months', hint: '180 days of course access' };
  }
  if (interval === '1_year' || plan.duration >= 300) {
    return { line: 'for 1 year', hint: '365 days of course access' };
  }
  return { line: `for ${plan.duration} days`, hint: 'One-time access' };
}

function isSixMonths(plan: Plan) {
  const interval = (plan.interval || '').toLowerCase();
  return interval === '6_months' || (plan.duration >= 150 && plan.duration < 300);
}

function isMonthly(plan: Plan) {
  const interval = (plan.interval || '').toLowerCase();
  return interval === '1_month' || (plan.duration > 0 && plan.duration <= 31);
}

export default function PriceScreen() {
  const { colors, isDark } = useTheme();
  const { hasActiveSubscription, subscription: authSubscription, refreshUser } = useAuth();
  const [pricingPlans, setPricingPlans] = useState<Plan[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [subscription, setSubscription] = useState<Subscription | null>(authSubscription);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    try {
      const [plans, currentUser, currentSub] = await Promise.all([
        listPlans(),
        refreshUser(),
        getCurrentSubscription(),
      ]);
      if (plans.length) {
        setPricingPlans(plans);
        const monthly = plans.find(isMonthly);
        setSelectedId((current) => current || monthly?.id || plans[0]?.id || '');
      }
      setSubscription(currentUser?.subscription || currentSub);
    } catch (error) {
      Alert.alert('Plans', error instanceof Error ? error.message : 'Could not load plans.');
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const selected = useMemo(
    () => pricingPlans.find((plan) => plan.id === selectedId) || pricingPlans[0],
    [pricingPlans, selectedId],
  );

  const endsAtLabel = formatSubscriptionDate(subscriptionEndsAt(subscription));
  const planLabel = subscription?.planName || subscription?.name;
  const daysLeft = subscription?.daysRemaining;
  const activeUntilCopy = daysLeft !== undefined
    ? `${planLabel || 'Your plan'} · ${daysLeft} day${daysLeft === 1 ? '' : 's'} left`
    : endsAtLabel
      ? `${planLabel || 'Your plan'} is active until ${endsAtLabel}`
      : `${planLabel || 'Your plan'} is still active`;

  const handleGetStarted = async (plan: Plan) => {
    if (hasActiveSubscription) {
      Alert.alert('Plan active', `Your plan is still active until ${endsAtLabel || 'the end date'}. You cannot buy another plan yet.`);
      return;
    }
    setPaying(true);
    try {
      const [order, config] = await Promise.all([createPaymentOrder(plan.id), getPaymentConfig()]);
      const keyId = order.keyId || config?.keyId || process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '';
      if (!keyId || !order.orderId) {
        Alert.alert('Payment', 'Checkout is not configured yet. The order was created on the server.');
        return;
      }
      router.push({
        pathname: '/checkout',
        params: {
          keyId,
          orderId: order.orderId,
          amount: String(order.amount),
          currency: order.currency || config?.currency || 'INR',
          name: order.name || 'SPKS Exams',
          description: order.description || plan.name,
        },
      } as any);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        Alert.alert('Plan active', error.message || `Your plan is still active until ${endsAtLabel || 'the end date'}.`);
        return;
      }
      Alert.alert('Payment', error instanceof Error ? error.message : 'Payment is not available yet.');
    } finally {
      setPaying(false);
    }
  };

  const ctaLabel = hasActiveSubscription
    ? 'Plan already active'
    : `Pay · ₹${formatAmount(selected?.price || 0)}`;

  return (
    <Screen>
      <ScreenScroll contentStyle={{ paddingTop: 8 }}>
        <ThemedText style={[styles.kicker, { color: colors.textSecondary }]}>Membership</ThemedText>
        <ThemedText style={[styles.pageTitle, { color: colors.text }]}>Pick a plan</ThemedText>
        <ThemedText style={[styles.pageHint, { color: colors.textSecondary }]}>
          1 month, 6 months, or 1 year. Course access ends on the plan date.
        </ThemedText>

        {hasActiveSubscription && planLabel ? (
          <View style={[styles.currentPlan, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.currentLabel, { color: colors.textSecondary }]}>You are on</ThemedText>
            <ThemedText style={[styles.currentName, { color: colors.text }]}>{planLabel}</ThemedText>
            <ThemedText style={[styles.currentHint, { color: colors.textSecondary }]}>{activeUntilCopy}</ThemedText>
          </View>
        ) : (
          <View style={[styles.currentPlan, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.currentLabel, { color: colors.textSecondary }]}>No active plan</ThemedText>
            <ThemedText style={[styles.currentName, { color: colors.text }]}>Pay to open courses</ThemedText>
            <ThemedText style={[styles.currentHint, { color: colors.textSecondary }]}>
              Home can show the course list. Opening a course needs a plan.
            </ThemedText>
          </View>
        )}

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={colors.tint} />
          </View>
        ) : pricingPlans.length ? (
          pricingPlans.map((plan) => {
            const selectedPlan = plan.id === selectedId;
            const copy = periodCopy(plan);
            const highlight = isSixMonths(plan);

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
                      <ThemedText style={styles.bestChipText}>Popular</ThemedText>
                    </View>
                  ) : null}
                </View>

                <View style={styles.priceBlock}>
                  {plan.price === 0 ? (
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
                        {formatAmount(plan.price)}
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
          })
        ) : (
          <ThemedText style={{ color: colors.textSecondary, textAlign: 'center', marginVertical: 24 }}>
            No plans are available yet.
          </ThemedText>
        )}

        {selected ? (
          <TouchableOpacity
            style={[styles.cta, hasActiveSubscription ? { opacity: 0.6 } : null]}
            onPress={() => handleGetStarted(selected)}
            activeOpacity={0.88}
            disabled={paying || loading || hasActiveSubscription}
          >
            <ThemedText style={styles.ctaText}>{paying ? 'Opening checkout...' : ctaLabel}</ThemedText>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity onPress={() => router.push('/profile/payments' as any)} style={{ alignItems: 'center', marginTop: 16 }}>
          <ThemedText style={{ color: colors.tint, fontWeight: '700' }}>View payment history</ThemedText>
        </TouchableOpacity>

        <View style={styles.perkRow}>
          <ThemedText style={[styles.perk, { color: colors.textMuted }]}>Secure payment</ThemedText>
          <ThemedText style={[styles.perkDot, { color: colors.textMuted }]}>·</ThemedText>
          <ThemedText style={[styles.perk, { color: colors.textMuted }]}>Cancel checkout to stay here</ThemedText>
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
  currentHint: {
    fontSize: 13,
    marginTop: 4,
  },
  loader: {
    paddingVertical: 32,
    alignItems: 'center',
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
