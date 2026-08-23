import { router } from 'expo-router';
import { Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ApiResultsModal } from '@/components/ui/api-results-modal';
import { useTheme } from '@/contexts/theme-context';
import { useCatalogResults } from '@/hooks/use-catalog-results';
import { loadCourseItems } from '@/lib/catalog';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

const GROUPS = [
  { id: '1', title: 'Group 1', icon: '1️⃣' },
  { id: '2', title: 'Group 2', icon: '2️⃣' },
  { id: '3', title: 'Group 3', icon: '3️⃣' },
  { id: '4', title: 'Group 4', icon: '4️⃣' },
  { id: '5', title: 'Others', icon: '📋' },
];

export default function TestScreen() {
  const { colors } = useTheme();
  const results = useCatalogResults();

  const handleBack = () => router.back();
  const handleGroupPress = (id: string, title: string) => {
    results.show(title, async () => {
      const groups = await loadCourseItems('tnpsc', 'groups');
      const group = groups.find((item) => `${item.title || item.name || ''}`.toLowerCase().includes(title.toLowerCase()) || item.id === id);
      return loadCourseItems('tnpsc', 'tests', group ? { groupId: group.id } : { search: title });
    });
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
          <ThemedText style={[styles.infoTitle, { color: colors.text }]}>Select Group</ThemedText>
          <ThemedText style={[styles.infoSubtitle, { color: colors.textSecondary }]}>Group 1 to 5 - Take tests</ThemedText>
        </View>
        <View style={styles.menuContainer}>
          {GROUPS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuCard, { backgroundColor: colors.card }]}
              onPress={() => handleGroupPress(item.id, item.title)}
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
  headerTitle: { fontSize: 20, fontWeight: '700' },
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
  menuTitle: { fontSize: 17, fontWeight: '600' },
  menuArrow: { fontSize: 24, fontWeight: '300' },
});
