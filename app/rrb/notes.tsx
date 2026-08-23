import { router } from 'expo-router';
import { Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ApiResultsModal } from '@/components/ui/api-results-modal';
import { useTheme } from '@/contexts/theme-context';
import { useCatalogResults } from '@/hooks/use-catalog-results';
import { loadCourseItems } from '@/lib/catalog';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

const NOTES_SUBJECTS = [
  { id: 'mathematics', title: 'Mathematics', icon: '🔢' },
  { id: 'reasoning', title: 'Reasoning', icon: '🧠' },
  { id: 'general-awareness', title: 'General Awareness', icon: '📰' },
  { id: 'science', title: 'Science', icon: '🔬' },
  { id: 'computer', title: 'Basics of Computer', icon: '💻' },
  { id: 'environment', title: 'Environment & Pollution', icon: '🌍' },
  { id: 'technical', title: 'Technical Subject', icon: '⚙️' },
];

export default function NotesScreen() {
  const { colors } = useTheme();
  const results = useCatalogResults();

  const handleBack = () => router.back();
  const handleSubjectPress = (id: string, title: string) => {
    results.show(title, () => loadCourseItems('rrb', 'notes', { search: title }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />
      <View style={styles.statusBarSpace} />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={[styles.backButton, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.backIcon, { color: colors.text }]}>←</ThemedText>
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Notes</ThemedText>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.infoTitle, { color: colors.text }]}>RRB Study Notes</ThemedText>
          <ThemedText style={[styles.infoSubtitle, { color: colors.textSecondary }]}>Complete syllabus coverage for all RRB exams</ThemedText>
        </View>

        <View style={styles.menuContainer}>
          {NOTES_SUBJECTS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuCard, { backgroundColor: colors.card }]}
              onPress={() => handleSubjectPress(item.id, item.title)}
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
  menuContainer: { gap: 12 },
  menuCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  menuIconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuIcon: { fontSize: 24 },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '600' },
  menuArrow: { fontSize: 24, fontWeight: '300' },
});
