import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { LoadingState } from '@/components/ui/brand-logo';
import { PageHeader } from '@/components/ui/page-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { useTheme } from '@/contexts/theme-context';
import { getAttemptResult, type TestResult } from '@/lib/tests';

export default function TestResultScreen() {
  const { colors } = useTheme();
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    if (!attemptId) return;
    getAttemptResult(attemptId)
      .then(setResult)
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <Screen>
        <PageHeader title="Result" />
        <LoadingState fill />
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader title={result?.title || 'Result'} />
      <ScreenScroll>
        <AppCard style={{ alignItems: 'center', paddingVertical: 28, marginBottom: 16 }}>
          <ThemedText style={[styles.score, { color: colors.text }]}>{result?.percentage ?? 0}%</ThemedText>
          <ThemedText style={{ color: colors.textSecondary, fontWeight: '700' }}>
            {result?.passed ? 'Passed' : 'Keep practising'}
          </ThemedText>
        </AppCard>
        <AppCard>
          <Row label="Score" value={`${result?.score ?? 0}${result?.totalMarks ? ` / ${result.totalMarks}` : ''}`} />
          <Row label="Correct" value={String(result?.correct ?? 0)} />
          <Row label="Incorrect" value={String(result?.incorrect ?? 0)} />
          <Row label="Unanswered" value={String(result?.unanswered ?? 0)} />
        </AppCard>

        {result?.questions?.length ? (
          <>
            <View style={{ height: 18 }} />
            <SectionHeading title="Answers" />
            {result.questions.map((item) => (
              <AppCard key={item.id} style={{ marginBottom: 10 }}>
                <ThemedText style={{ color: colors.text, fontWeight: '700', marginBottom: 8 }}>{item.question || 'Question'}</ThemedText>
                <ThemedText style={{ color: item.isCorrect ? '#059669' : colors.danger, fontWeight: '700' }}>
                  {item.isCorrect ? 'Correct' : 'Incorrect'}
                </ThemedText>
                <ThemedText style={{ color: colors.textSecondary, marginTop: 6 }}>Your answer: {item.selectedAnswer || '—'}</ThemedText>
                <ThemedText style={{ color: colors.textSecondary }}>Correct answer: {item.correctAnswer || '—'}</ThemedText>
              </AppCard>
            ))}
          </>
        ) : null}

        <View style={{ height: 16 }} />
        <PrimaryButton title="Back to tests" onPress={() => router.back()} />
      </ScreenScroll>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <ThemedText style={{ color: colors.textSecondary }}>{label}</ThemedText>
      <ThemedText style={{ color: colors.text, fontWeight: '800' }}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  score: { fontSize: 42, fontWeight: '800', marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
});
