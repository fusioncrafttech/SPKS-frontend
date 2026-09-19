import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedText } from '@/components/themed-text';
import { LoadingState } from '@/components/ui/brand-logo';
import { PageHeader } from '@/components/ui/page-header';
import { PdfViewer } from '@/components/ui/pdf-viewer';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen } from '@/components/ui/screen';
import { useTheme } from '@/contexts/theme-context';
import { completeLesson, contentViewUrl, getContent, hasContentPdf, isLockedItem, markLessonProgress, toggleBookmark } from '@/lib/study';
import { handlePremiumError, promptPremium } from '@/lib/tests';

export default function ContentScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [content, setContent] = useState<Record<string, any> | null>(null);
  const [viewUrl, setViewUrl] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getContent(id);
        setContent(data);
        setBookmarked(Boolean(data?.isBookmarked));
        if (data?.lessonId) void markLessonProgress(String(data.lessonId));
        if (isLockedItem(data || {})) {
          promptPremium('This PDF is locked. Buy a plan to open it.');
          return;
        }
        if (hasContentPdf(data) || data?.viewUrl) {
          setViewUrl(contentViewUrl(id, data));
        }
      } catch (error) {
        if (handlePremiumError(error, 'This PDF is locked. Buy a plan to open it.')) {
          setContent({ isLocked: true });
          return;
        }
        Alert.alert('Content', error instanceof Error ? error.message : 'Could not load this item.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const html = content?.html || content?.body || content?.content;
  const locked = isLockedItem(content || {});

  const handleBookmark = async () => {
    if (!id) return;
    try {
      await toggleBookmark('content', id, bookmarked);
      setBookmarked((value) => !value);
    } catch (error) {
      Alert.alert('Bookmark', error instanceof Error ? error.message : 'Could not update bookmark.');
    }
  };

  const handleComplete = async () => {
    if (content?.lessonId) await completeLesson(String(content.lessonId));
    Alert.alert('Saved', 'Lesson marked complete.');
  };

  return (
    <Screen>
      <PageHeader
        title={content?.title || 'Content'}
        right={
          <TouchableOpacity onPress={handleBookmark} style={[styles.iconBtn, { backgroundColor: colors.card }]}>
            <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color={colors.text} />
          </TouchableOpacity>
        }
      />
      {loading ? (
        <LoadingState fill />
      ) : locked ? (
        <View style={styles.center}>
          <ThemedText style={{ color: colors.text, fontWeight: '800', marginBottom: 8 }}>Premium content</ThemedText>
          <ThemedText style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 16 }}>Upgrade to open this file.</ThemedText>
          <PrimaryButton title="View plans" onPress={() => router.push('/(tabs)/price')} />
        </View>
      ) : viewUrl ? (
        <PdfViewer uri={viewUrl} />
      ) : html ? (
        <WebView originWhitelist={['*']} source={{ html: String(html) }} style={{ flex: 1 }} />
      ) : (
        <View style={styles.center}>
          <ThemedText style={{ color: colors.text, fontWeight: '800', marginBottom: 8 }}>{content?.title || 'Content'}</ThemedText>
          <ThemedText style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 16 }}>
            {content?.description || content?.summary || 'No PDF is available to view yet.'}
          </ThemedText>
        </View>
      )}
      {!locked && content?.lessonId ? (
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity onPress={handleComplete} style={styles.complete}>
            <ThemedText style={{ color: colors.tint, fontWeight: '700' }}>Mark complete</ThemedText>
          </TouchableOpacity>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconBtn: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  footer: { padding: 16, borderTopWidth: 1, gap: 10 },
  complete: { alignItems: 'center', paddingVertical: 8 },
});
