import { StyleSheet, View, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { router } from 'expo-router';

import { useTheme } from '@/contexts/theme-context';
import { ThemedText } from '@/components/themed-text';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

const VIDEO_CATEGORIES = [
  { id: 'state-updates', title: 'State Current Affairs', icon: '🏛️' },
  { id: 'india-updates', title: 'India Current Affairs', icon: '🇮🇳' },
  { id: 'international', title: 'International Affairs', icon: '🌍' },
  { id: 'daily-analysis', title: 'Daily Analysis', icon: '📊' },
  { id: 'monthly-digest', title: 'Monthly Digest', icon: '📅' },
];

export default function VideoScreen() {
  const { colors } = useTheme();

  const handleBack = () => router.back();
  const handleVideoPress = (id: string, title: string) => {
    console.log(`Current Affairs Video - ${id}: ${title}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />
      <View style={styles.statusBarSpace} />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={[styles.backButton, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.backIcon, { color: colors.text }]}>←</ThemedText>
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Video Explain</ThemedText>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.infoTitle, { color: colors.text }]}>Current Affairs Video Explanations</ThemedText>
          <ThemedText style={[styles.infoSubtitle, { color: colors.textSecondary }]}>Direct Connect YouTube - Daily current affairs analysis</ThemedText>
        </View>

        <View style={styles.youtubeBanner}>
          <View style={[styles.youtubeIconContainer, { backgroundColor: colors.background }]}>
            <ThemedText style={styles.youtubeIcon}>🎥</ThemedText>
          </View>
          <View style={styles.youtubeContent}>
            <ThemedText style={[styles.youtubeTitle, { color: colors.text }]}>Direct Connect YouTube</ThemedText>
            <ThemedText style={[styles.youtubeSubtitle, { color: colors.textSecondary }]}>Expert analysis of daily current affairs</ThemedText>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Select Video Category</ThemedText>
        </View>
        <View style={styles.menuContainer}>
          {VIDEO_CATEGORIES.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuCard, { backgroundColor: colors.card }]}
              onPress={() => handleVideoPress(item.id, item.title)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
                <ThemedText style={styles.menuIcon}>{item.icon}</ThemedText>
              </View>
              <View style={styles.menuTextContainer}>
                <ThemedText style={[styles.menuTitle, { color: colors.text }]}>{item.title}</ThemedText>
                <ThemedText style={[styles.menuSubtitle, { color: colors.textSecondary }]}>Video tutorials available</ThemedText>
              </View>
              <ThemedText style={[styles.menuArrow, { color: colors.textMuted }]}>›</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusBarSpace: { height: STATUSBAR_HEIGHT, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backButton: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  backIcon: { fontSize: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  placeholder: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  infoCard: { borderRadius: 20, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  infoTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  infoSubtitle: { fontSize: 14 },
  youtubeBanner: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, marginBottom: 24, backgroundColor: '#FF0000', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 5 },
  youtubeIconContainer: { width: 56, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16, backgroundColor: '#FFFFFF' },
  youtubeIcon: { fontSize: 28 },
  youtubeContent: { flex: 1 },
  youtubeTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4, color: '#FFFFFF' },
  youtubeSubtitle: { fontSize: 13, color: '#FFFFFF' },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  menuContainer: { gap: 12 },
  menuCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  menuIconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuIcon: { fontSize: 24 },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '600' },
  menuSubtitle: { fontSize: 12 },
  menuArrow: { fontSize: 24, fontWeight: '300' },
});
