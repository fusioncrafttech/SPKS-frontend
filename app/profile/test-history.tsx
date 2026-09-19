import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { LoadingState } from '@/components/ui/brand-logo';
import { MenuRow, MenuStack } from '@/components/ui/menu-row';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { useTheme } from '@/contexts/theme-context';
import { router } from 'expo-router';
import { getTestHistory, type TestHistoryItem } from '@/lib/tests';

export default function TestHistoryScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<TestHistoryItem[]>([]);

  useEffect(() => {
    getTestHistory()
      .then(setItems)
      .catch((error) => Alert.alert('History', error instanceof Error ? error.message : 'Could not load test history.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen>
      <PageHeader title="Test history" />
      <ScreenScroll>
        {loading ? (
          <LoadingState />
        ) : items.length ? (
          <MenuStack>
            {items.map((item, index) => (
              <MenuRow
                key={item.id}
                title={item.title || item.testTitle || 'Test'}
                subtitle={`${item.percentage ?? item.score ?? 0}% · ${String(item.submittedAt || item.createdAt || '').slice(0, 10)}`}
                icon="create-outline"
                index={index}
                onPress={() => router.push(`/test-result/${item.attemptId || item.id}` as any)}
              />
            ))}
          </MenuStack>
        ) : (
          <AppCard>
            <ThemedText style={{ color: colors.textSecondary, textAlign: 'center' }}>No tests submitted yet.</ThemedText>
          </AppCard>
        )}
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { paddingVertical: 40, alignItems: 'center' },
});
