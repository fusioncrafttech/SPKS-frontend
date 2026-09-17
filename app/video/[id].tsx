import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedText } from '@/components/themed-text';
import { PageHeader } from '@/components/ui/page-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen } from '@/components/ui/screen';
import { useTheme } from '@/contexts/theme-context';
import { getVideo, isLockedItem, markLessonProgress, recordVideoView, toggleBookmark } from '@/lib/study';
import { promptPremium } from '@/lib/tests';

function youtubeSrc(video: Record<string, any> | null) {
  const id = video?.youtubeId || video?.youtube_id;
  if (id) return `https://www.youtube.com/embed/${id}`;
  return video?.videoUrl || video?.url || '';
}

export default function VideoScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [video, setVideo] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (!id) return;
    getVideo(id)
      .then((data) => {
        setVideo(data);
        setBookmarked(Boolean(data?.isBookmarked));
        if (data?.lessonId) void markLessonProgress(String(data.lessonId));
        if (isLockedItem(data || {})) promptPremium();
        else void recordVideoView(id);
      })
      .catch((error) => Alert.alert('Video', error instanceof Error ? error.message : 'Could not load this video.'))
      .finally(() => setLoading(false));
  }, [id]);

  const src = useMemo(() => youtubeSrc(video), [video]);
  const locked = isLockedItem(video || {});

  const handleBookmark = async () => {
    if (!id) return;
    try {
      await toggleBookmark('videos', id, bookmarked);
      setBookmarked((value) => !value);
    } catch (error) {
      Alert.alert('Bookmark', error instanceof Error ? error.message : 'Could not update bookmark.');
    }
  };

  return (
    <Screen>
      <PageHeader
        title={video?.title || 'Video'}
        right={
          <TouchableOpacity onPress={handleBookmark} style={[styles.iconBtn, { backgroundColor: colors.card }]}>
            <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color={colors.text} />
          </TouchableOpacity>
        }
      />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.tint} />
        </View>
      ) : locked ? (
        <View style={styles.center}>
          <ThemedText style={{ color: colors.text, fontWeight: '800', marginBottom: 8 }}>Premium video</ThemedText>
          <PrimaryButton title="View plans" onPress={() => router.push('/(tabs)/price')} />
        </View>
      ) : src ? (
        <WebView source={{ uri: src }} style={{ flex: 1 }} allowsFullscreenVideo />
      ) : (
        <View style={styles.center}>
          <ThemedText style={{ color: colors.textSecondary }}>No video URL is available yet.</ThemedText>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconBtn: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
