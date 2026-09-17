import { Alert } from 'react-native';
import { router } from 'expo-router';

import { ApiError, api, asList } from './api';
import { asCatalogItem, type CatalogItem } from './catalog';

export type TestQuestion = {
  id: string;
  question: string;
  questionImage?: string | null;
  options: string[];
  questionNumber?: number;
  marks?: number;
  correctAnswer?: string;
  selectedAnswer?: string;
  isCorrect?: boolean;
  marksAwarded?: number;
};

export type StartedAttempt = {
  attemptId: string;
  testId: string;
  title: string;
  duration: number;
  questions: TestQuestion[];
  answers: Record<string, string>;
};

export type TestResult = {
  attemptId: string;
  userId?: string;
  title?: string;
  score?: number;
  total?: number;
  totalMarks?: number;
  correct?: number;
  incorrect?: number;
  unanswered?: number;
  percentage?: number;
  passed?: boolean;
  timeSpent?: number;
  questions: TestQuestion[];
};

export type TestHistoryItem = {
  id: string;
  attemptId?: string;
  userId?: string;
  title?: string;
  testTitle?: string;
  score?: number;
  percentage?: number;
  passed?: boolean;
  createdAt?: string;
  submittedAt?: string;
};

let cachedAttempt: StartedAttempt | null = null;

export function cacheAttempt(attempt: StartedAttempt) {
  cachedAttempt = attempt;
}

export function getCachedAttempt(attemptId: string) {
  return cachedAttempt?.attemptId === attemptId ? cachedAttempt : null;
}

export function isPremiumRequired(error: unknown) {
  return error instanceof ApiError && (error.code === 'PREMIUM_REQUIRED' || error.status === 403);
}

export function promptPremium(message?: string) {
  Alert.alert('Premium required', message || 'This test is locked. Upgrade your plan to continue.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'View plans', onPress: () => router.push('/(tabs)/price') },
  ]);
}

function asOptions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'string' || typeof item === 'number') return String(item).trim();
      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>;
        return String(record.text || record.label || record.option || record.value || '').trim();
      }
      return String(item).trim();
    }).filter(Boolean);
  }
  return [];
}

function mapQuestion(item: Record<string, any>, index: number): TestQuestion {
  return {
    id: String(item.id || item.questionId || index),
    question: String(item.question || item.text || item.title || `Question ${index + 1}`),
    questionImage: item.questionImage || item.imageUrl || null,
    options: asOptions(item.options || item.choices),
    questionNumber: Number(item.questionNumber || index + 1),
    marks: Number(item.marks || 1),
    correctAnswer: item.correctAnswer ? String(item.correctAnswer) : undefined,
    selectedAnswer: item.selectedAnswer ? String(item.selectedAnswer) : undefined,
    isCorrect: typeof item.isCorrect === 'boolean' ? item.isCorrect : undefined,
    marksAwarded: item.marksAwarded !== undefined ? Number(item.marksAwarded) : undefined,
  };
}

function mapSavedAnswers(value: unknown): Record<string, string> {
  const answers: Record<string, string> = {};
  for (const item of asList<Record<string, any>>(value as any)) {
    const questionId = String(item.questionId || item.id || '');
    const selected = String(item.selectedAnswer || item.answer || '');
    if (questionId && selected) answers[questionId] = selected;
  }
  return answers;
}

function isPublishedTest(item: Record<string, any>) {
  if (!item?.id) return false;
  if (item.isPublished === false || item.published === false) return false;
  if (item.isActive === false) return false;
  return true;
}

function mapAttempt(data: Record<string, any>, testId: string): StartedAttempt {
  const attempt = data.attempt || data;
  const test = data.test || {};
  const questions = asList<Record<string, any>>(data.questions || test.questions || attempt.questions);
  return {
    attemptId: String(attempt.id || attempt.attemptId || data.attemptId || data.id),
    testId: String(attempt.testId || test.id || data.testId || testId),
    title: String(test.title || data.title || attempt.title || 'Test'),
    duration: Number(test.duration || data.duration || attempt.duration || 0),
    questions: questions.map(mapQuestion),
    answers: mapSavedAnswers(data.answers),
  };
}

export function asTestCatalogItem(item: Record<string, any>, index = 0): CatalogItem {
  return {
    ...asCatalogItem(item, index),
    title: item.title || item.name,
    description: item.description,
    category: 'test',
    duration: item.duration,
    totalQuestions: Number(item.totalQuestions || 0),
    isLocked: Boolean(item.isLocked),
    isPremium: Boolean(item.isPremium),
  };
}

export async function listTests(query?: { courseId?: string; groupId?: string; search?: string }) {
  return asList<Record<string, any>>(await api.get('/api/tests', { ...query, limit: 50 }))
    .filter(isPublishedTest)
    .map(asTestCatalogItem);
}

export async function listGroupTests(groupId: string) {
  return asList<Record<string, any>>(await api.get(`/api/groups/${groupId}/tests`, { limit: 50 }))
    .filter(isPublishedTest)
    .map(asTestCatalogItem);
}

export async function startTest(testId: string) {
  const data = await api.post<Record<string, any>>(`/api/tests/${testId}/start`);
  const attempt = mapAttempt(data || {}, testId);
  cacheAttempt(attempt);
  return attempt;
}

export async function getAttempt(attemptId: string) {
  const data = await api.get<Record<string, any>>(`/api/attempts/${attemptId}`);
  const attempt = mapAttempt(data || {}, '');
  const cached = getCachedAttempt(attemptId);
  if (!attempt.questions.length && cached?.questions.length) attempt.questions = cached.questions;
  if (!Object.keys(attempt.answers).length && cached?.answers) attempt.answers = cached.answers;
  cacheAttempt(attempt);
  return attempt;
}

export async function saveAnswers(attemptId: string, answers: { questionId: string; selectedAnswer: string }[]) {
  return api.post(`/api/attempts/${attemptId}/answers`, { answers });
}

export async function submitAttempt(attemptId: string, answers?: { questionId: string; selectedAnswer: string }[]) {
  return api.post(`/api/attempts/${attemptId}/submit`, answers?.length ? { answers } : {});
}

export async function getAttemptResult(attemptId: string) {
  const data = (await api.get<Record<string, any>>(`/api/attempts/${attemptId}/result`)) || {};
  const result = data.result || data;
  return {
    attemptId: String(result.attemptId || data.attemptId || attemptId),
    userId: String(result.userId || data.userId || ''),
    title: result.title || data.title,
    score: Number(result.score ?? data.score ?? 0),
    total: Number(result.total ?? data.total ?? 0),
    totalMarks: Number(result.totalMarks ?? data.totalMarks ?? 0),
    correct: Number(result.correct ?? data.correct ?? 0),
    incorrect: Number(result.incorrect ?? data.incorrect ?? 0),
    unanswered: Number(result.unanswered ?? data.unanswered ?? 0),
    percentage: Math.round(Number(result.percentage ?? data.percentage ?? 0)),
    passed: Boolean(result.passed ?? data.passed),
    timeSpent: Number(result.timeSpent ?? data.timeSpent ?? 0),
    questions: asList<Record<string, any>>(data.questions || result.questions).map(mapQuestion),
  } as TestResult;
}

export async function getTestHistory() {
  return asList<TestHistoryItem>(await api.get('/api/users/me/test-history'));
}

export async function startTestFlow(testId: string, locked?: boolean) {
  if (locked) {
    promptPremium();
    return;
  }
  try {
    const attempt = await startTest(testId);
    router.push(`/test/${attempt.attemptId}` as any);
  } catch (error) {
    if (isPremiumRequired(error)) {
      promptPremium(error instanceof ApiError ? error.message : undefined);
      return;
    }
    Alert.alert('Test', error instanceof Error ? error.message : 'Could not start this test.');
  }
}
