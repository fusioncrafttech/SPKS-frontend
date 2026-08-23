import { router } from 'expo-router';
import { Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ApiResultsModal } from '@/components/ui/api-results-modal';
import { useTheme } from '@/contexts/theme-context';
import { useCatalogResults } from '@/hooks/use-catalog-results';
import { loadCourseItems } from '@/lib/catalog';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

const GROUP_D_TESTS = [
  { id: 'group-d-topicwise', title: 'Topic-wise Test', icon: '📋' },
  { id: 'group-d-full', title: 'Full Test', icon: '📝' },
];

const OTHER_TESTS = [
  { id: 'ntpc-cbt1-topicwise', title: 'NTPC CBT 1 - Topic-wise', icon: '📋' },
  { id: 'ntpc-cbt1-full', title: 'NTPC CBT 1 - Full Test', icon: '📝' },
  { id: 'ntpc-cbt2-topicwise', title: 'NTPC CBT 2 - Topic-wise', icon: '📋' },
  { id: 'ntpc-cbt2-full', title: 'NTPC CBT 2 - Full Test', icon: '📝' },
  { id: 'je-cbt1-topicwise', title: 'JE CBT 1 - Topic-wise', icon: '📋' },
  { id: 'je-cbt1-full', title: 'JE CBT 1 - Full Test', icon: '📝' },
  { id: 'je-cbt2-topicwise', title: 'JE CBT 2 - Topic-wise', icon: '📋' },
  { id: 'je-cbt2-full', title: 'JE CBT 2 - Full Test', icon: '📝' },
  { id: 'alp-cbt1-topicwise', title: 'ALP CBT 1 - Topic-wise', icon: '📋' },
  { id: 'alp-cbt1-full', title: 'ALP CBT 1 - Full Test', icon: '📝' },
  { id: 'alp-cbt2-topicwise', title: 'ALP CBT 2 - Topic-wise', icon: '📋' },
  { id: 'alp-cbt2-full', title: 'ALP CBT 2 - Full Test', icon: '📝' },
];

export default function TestScreen() {
  const { colors } = useTheme();
  const results = useCatalogResults();

  const handleBack = () => router.back();
  const handleTestPress = (id: string, title: string) => {
    results.show(title, () => loadCourseItems('rrb', 'tests', { search: title }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />
      <View style={styles.statusBarSpace} />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={[styles.backButton, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.backIcon, { color: colors.text }]}>←</ThemedText>
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Test</ThemedText>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.infoTitle, { color: colors.text }]}>RRB Practice Tests</ThemedText>
          <ThemedText style={[styles.infoSubtitle, { color: colors.textSecondary }]}>Topic-wise and Full tests for all RRB exams</ThemedText>
        </View>

        {/* Group D Section */}
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Group D</ThemedText>
        </View>
        <View style={styles.menuContainer}>
          {GROUP_D_TESTS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuCard, { backgroundColor: colors.card }]}
              onPress={() => handleTestPress(item.id, item.title)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
                <ThemedText style={styles.menuIcon}>{item.icon}</ThemedText>
              </View>
              <View style={styles.menuTextContainer}>
                <ThemedText style={[styles.menuTitle, { color: colors.text }]}>{item.title}</ThemedText>
              </View>
              <ThemedText style={[styles.menuArrow, { color: colors.textMuted }]}>›</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Other Exams Section */}
        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Others (NTPC, JE, ALP)</ThemedText>
        </View>
        <View style={styles.menuContainer}>
          {OTHER_TESTS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuCard, { backgroundColor: colors.card }]}
              onPress={() => handleTestPress(item.id, item.title)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
                <ThemedText style={styles.menuIcon}>{item.icon}</ThemedText>
              </View>
              <View style={styles.menuTextContainer}>
                <ThemedText style={[styles.menuTitle, { color: colors.text }]}>{item.title}</ThemedText>
              </View>
              <ThemedText style={[styles.menuArrow, { color: colors.textMuted }]}>›</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <ApiResultsModal visible={results.visible} title={results.title} loading={results.loading} items={results.items} emptyMessage={results.emptyMessage} onClose={results.close} />
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
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  menuContainer: { gap: 12 },
  menuCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  menuIconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuIcon: { fontSize: 24 },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '600' },
  menuArrow: { fontSize: 24, fontWeight: '300' },
});
