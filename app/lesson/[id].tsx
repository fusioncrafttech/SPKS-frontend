import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedText } from '@/components/themed-text';
import { PageHeader } from '@/components/ui/page-header';
import { PdfViewer } from '@/components/ui/pdf-viewer';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { useTheme } from '@/contexts/theme-context';
import { completeLesson, getLesson, hasLessonPdf, isLockedItem, lessonPdfViewUrl, markLessonProgress } from '@/lib/study';
import { handlePremiumError, promptPremium } from '@/lib/tests';

export default function LessonScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (!id) return;
    getLesson(id)
      .then(async (data) => {
        setLesson(data);
        if (isLockedItem(data || {})) {
          promptPremium('This lesson is locked. Buy a plan to continue.');
          return;
        }
        await markLessonProgress(id);
      })
      .catch((error) => {
        if (handlePremiumError(error, 'This lesson is locked. Buy a plan to continue.')) {
          setLesson({ isLocked: true });
          return;
        }
        Alert.alert('Lesson', error instanceof Error ? error.message : 'Could not load this lesson.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const html = lesson?.html || lesson?.body;
  const videoUrl = lesson?.videoUrl || lesson?.youtubeId;
  const pdfUri = id ? lessonPdfViewUrl(id, lesson) : '';
  const showPdf = Boolean(id) && hasLessonPdf(lesson);

  const handleComplete = async () => {
    if (!id) return;
    try {
      await completeLesson(id);
      Alert.alert('Saved', 'Lesson marked complete.');
    } catch (error) {
      Alert.alert('Lesson', error instanceof Error ? error.message : 'Could not mark this complete.');
    }
  };

  if (loading) {
    return (
      <Screen>
        <PageHeader title="Lesson" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.tint} />
        </View>
      </Screen>
    );
  }

  if (isLockedItem(lesson || {})) {
    return (
      <Screen>
        <PageHeader title="Lesson" />
        <View style={styles.center}>
          <ThemedText style={{ color: colors.text, fontWeight: '800', marginBottom: 8 }}>Premium lesson</ThemedText>
          <PrimaryButton title="View plans" onPress={() => router.push('/(tabs)/price')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader title={lesson?.title || 'Lesson'} />
      {showPdf && pdfUri ? (
        <PdfViewer uri={pdfUri} />
      ) : html ? (
        <WebView originWhitelist={['*']} source={{ html: String(html) }} style={{ flex: 1 }} />
      ) : (
        <ScreenScroll>
          <ThemedText style={[styles.title, { color: colors.text }]}>{lesson?.title || 'Lesson'}</ThemedText>
          <ThemedText style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: 16 }}>
            {lesson?.description || lesson?.summary || 'Admin has not uploaded a PDF for this lesson yet.'}
          </ThemedText>
          {videoUrl ? (
            <PrimaryButton title="Open video" onPress={() => router.push(`/video/${id}` as any)} />
          ) : null}
        </ScreenScroll>
      )}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <PrimaryButton title="Mark complete" onPress={handleComplete} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  footer: { padding: 16, borderTopWidth: 1 },
});
