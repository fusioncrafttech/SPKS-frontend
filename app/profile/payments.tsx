import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { LoadingState } from '@/components/ui/brand-logo';
import { MenuRow, MenuStack } from '@/components/ui/menu-row';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { useTheme } from '@/contexts/theme-context';
import { getPaymentHistory, type PaymentRecord } from '@/lib/payments';

export default function PaymentHistoryScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    getPaymentHistory()
      .then(setItems)
      .catch((error) => Alert.alert('Payments', error instanceof Error ? error.message : 'Could not load history.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen>
      <PageHeader title="Payment history" />
      <ScreenScroll>
        {loading ? (
          <LoadingState />
        ) : items.length ? (
          <MenuStack>
            {items.map((item, index) => (
              <MenuRow
                key={item.id}
                title={item.planName || `Payment ${index + 1}`}
                subtitle={`${item.status || 'paid'} · ${item.createdAt ? String(item.createdAt).slice(0, 10) : ''}`}
                icon="card-outline"
                index={index}
              />
            ))}
          </MenuStack>
        ) : (
          <AppCard>
            <ThemedText style={{ color: colors.textSecondary, textAlign: 'center' }}>No payments yet.</ThemedText>
          </AppCard>
        )}
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { paddingVertical: 40, alignItems: 'center' },
});
