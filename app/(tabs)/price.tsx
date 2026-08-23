import { StyleSheet, View, ScrollView, TouchableOpacity, StatusBar, Platform, Alert } from 'react-native';
import { useEffect, useState } from 'react';

import { useTheme } from '@/contexts/theme-context';
import { ThemedText } from '@/components/themed-text';
import { api, asList } from '@/lib/api';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  color: string;
  popular: boolean;
};

function formatPrice(value: unknown, currency = 'INR') {
  const amount = Number(value);
  if (Number.isNaN(amount)) return String(value || '₹0');
  if (currency === 'INR' || currency === '₹') return `₹${amount}`;
  return `${currency} ${amount}`;
}

function formatPeriod(duration: unknown) {
  if (!duration) return '/month';
  const text = String(duration);
  if (text.includes('/')) return text;
  return `/${text}`;
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

export default function PriceScreen() {
  const { colors } = useTheme();

  const fallbackPlans: Plan[] = [
    { id: '1', name: 'Basic', price: '₹199', period: '/month', features: ['Access to 2 courses', 'Daily quizzes', 'Basic support', 'Progress tracking'], color: colors.tint, popular: false },
    { id: '2', name: 'Pro', price: '₹499', period: '/month', features: ['Access to all courses', 'Unlimited quizzes', 'Priority support', 'Detailed analytics', 'Offline access'], color: colors.gradient2[0], popular: true },
    { id: '3', name: 'Premium', price: '₹999', period: '/month', features: ['Everything in Pro', 'One-on-one mentoring', 'Mock interviews', 'Certificate', 'Lifetime access'], color: colors.success, popular: false },
  ];
  const [pricingPlans, setPricingPlans] = useState(fallbackPlans);

  useEffect(() => {
    api.get<Record<string, any>[]>('/api/plans')
      .then((items) => {
        const list = asList(items);
        if (!list.length) return;
        setPricingPlans(list.map((plan, index) => ({
          id: String(plan.id),
          name: plan.name || 'Plan',
          price: formatPrice(plan.price, plan.currency),
          period: formatPeriod(plan.duration),
          features: parseFeatures(plan.features).length ? parseFeatures(plan.features) : ['Course access'],
          color: index === 1 ? colors.gradient2[0] : index === 2 ? colors.success : colors.tint,
          popular: Boolean(plan.popular || index === 1),
        })));
      })
      .catch(() => undefined);
  }, [colors]);

  const handleGetStarted = async (plan: Plan) => {
    try {
      await api.post('/api/payments/create-order', { planId: plan.id });
      Alert.alert('Order created', `Continue checkout for ${plan.name}.`);
    } catch (error) {
      Alert.alert('Payment', error instanceof Error ? error.message : 'Payment is not available yet.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />
      <View style={styles.statusBarSpace} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Choose Your Plan</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Select the perfect plan for your preparation journey
          </ThemedText>
        </View>

        {/* Pricing Cards */}
        {pricingPlans.map((plan) => (
          <View key={plan.id} style={[styles.card, { backgroundColor: colors.card }, plan.popular && styles.popularCard]}>
            {plan.popular && (
              <View style={[styles.popularBadge, { backgroundColor: colors.tint }]}>
                <ThemedText style={styles.popularText}>Most Popular</ThemedText>
              </View>
            )}
            
            <ThemedText style={[styles.planName, { color: plan.color }]}>{plan.name}</ThemedText>
            
            <View style={styles.priceRow}>
              <ThemedText style={[styles.price, { color: colors.text }]}>{plan.price}</ThemedText>
              <ThemedText style={[styles.period, { color: colors.textSecondary }]}>{plan.period}</ThemedText>
            </View>

            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <ThemedText style={[styles.checkmark, { color: plan.color }]}>✓</ThemedText>
                  <ThemedText style={[styles.featureText, { color: colors.text }]}>{feature}</ThemedText>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: plan.color }]}
              activeOpacity={0.8}
              onPress={() => handleGetStarted(plan)}
            >
              <ThemedText style={styles.buttonText}>Get Started</ThemedText>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarSpace: {
    height: STATUSBAR_HEIGHT,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  popularCard: {
    borderWidth: 2,
    borderColor: '#f5576c',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#f5576c',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  period: {
    fontSize: 14,
    color: '#8e8e93',
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#1a1a2e',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
