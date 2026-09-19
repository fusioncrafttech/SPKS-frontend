import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PageHeader } from '@/components/ui/page-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { useTheme } from '@/contexts/theme-context';
import { getAttempt, saveAnswers, submitAttempt, type TestQuestion } from '@/lib/tests';

export default function TakeTestScreen() {
  const { colors } = useTheme();
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('Test');
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const answersRef = useRef<Record<string, string>>({});
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
        const id = String(attemptId || '');
        const payload = Object.entries(answersRef.current).map(([questionId, selectedAnswer]) => ({
          questionId,
          selectedAnswer,
        }));
        if (id && payload.length) void saveAnswers(id, payload);
      }
    };
  }, [attemptId]);

  useEffect(() => {
    if (!attemptId) return;
    getAttempt(attemptId)
      .then((attempt) => {
        setTitle(attempt.title);
        setQuestions(attempt.questions);
        setAnswers(attempt.answers || {});
      })
      .catch((error) => Alert.alert('Test', error instanceof Error ? error.message : 'Could not load this attempt.'))
      .finally(() => setLoading(false));
  }, [attemptId]);

  const question = questions[index];
  const progress = useMemo(
    () => (questions.length ? `${index + 1} / ${questions.length}` : '0 / 0'),
    [index, questions.length]
  );

  const persistAnswers = async (nextAnswers = answersRef.current) => {
    if (!attemptId) return;
    const payload = Object.entries(nextAnswers).map(([questionId, selectedAnswer]) => ({ questionId, selectedAnswer }));
    if (!payload.length) return;
    await saveAnswers(attemptId, payload);
  };

  const choose = (option: string) => {
    if (!question || !attemptId) return;
    setAnswers((current) => {
      const next = { ...current, [question.id]: option };
      answersRef.current = next;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void persistAnswers(next);
      }, 400);
      return next;
    });
  };

  const goNext = async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    try {
      await persistAnswers();
    } catch {
      // Keep going locally if autosave fails.
    }
    if (index < questions.length - 1) setIndex((value) => value + 1);
  };

  const handleSubmit = () => {
    Alert.alert('Submit test', 'You cannot change answers after submitting.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit',
        onPress: async () => {
          setSubmitting(true);
          try {
            if (saveTimer.current) {
              clearTimeout(saveTimer.current);
              saveTimer.current = null;
            }
            const payload = Object.entries(answersRef.current).map(([questionId, selectedAnswer]) => ({ questionId, selectedAnswer }));
            await saveAnswers(String(attemptId), payload);
            await submitAttempt(String(attemptId), payload);
            router.replace(`/test-result/${attemptId}` as any);
          } catch (error) {
            Alert.alert('Submit', error instanceof Error ? error.message : 'Could not submit this test.');
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <Screen>
        <PageHeader title="Test" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.tint} />
        </View>
      </Screen>
    );
  }

  if (!question) {
    return (
      <Screen>
        <PageHeader title={title} />
        <View style={styles.center}>
          <ThemedText style={{ color: colors.textSecondary }}>No questions were returned for this test.</ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader title={title} />
      <ScreenScroll>
        <ThemedText style={[styles.progress, { color: colors.textSecondary }]}>{progress}</ThemedText>
        <ThemedText style={[styles.question, { color: colors.text }]}>{question.question}</ThemedText>
        {question.questionImage ? <Image source={{ uri: question.questionImage }} style={styles.image} /> : null}
        {question.options.map((option) => {
          const selected = answers[question.id] === option;
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                {
                  backgroundColor: selected ? '#E0E7FF' : colors.card,
                  borderColor: selected ? '#4338CA' : colors.border,
                },
              ]}
              onPress={() => choose(option)}
              activeOpacity={0.85}
            >
              <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={18} color={selected ? '#4338CA' : colors.textMuted} />
              <ThemedText style={[styles.optionText, { color: colors.text }]}>{option}</ThemedText>
            </TouchableOpacity>
          );
        })}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: colors.card }]}
            disabled={index === 0}
            onPress={() => setIndex((value) => Math.max(0, value - 1))}
          >
            <ThemedText style={{ color: colors.text, fontWeight: '700' }}>Previous</ThemedText>
          </TouchableOpacity>
          {index < questions.length - 1 ? (
            <TouchableOpacity style={[styles.navBtn, { backgroundColor: '#4338CA' }]} onPress={goNext}>
              <ThemedText style={{ color: '#FFFFFF', fontWeight: '700' }}>Next</ThemedText>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }}>
              <PrimaryButton title={submitting ? 'Submitting...' : 'Submit test'} onPress={handleSubmit} disabled={submitting} />
            </View>
          )}
        </View>
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  progress: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  question: { fontSize: 18, fontWeight: '800', lineHeight: 26, marginBottom: 16 },
  image: { width: '100%', height: 180, borderRadius: 16, marginBottom: 16, backgroundColor: '#E0E7FF' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  optionText: { flex: 1, fontSize: 15, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  navBtn: { flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
