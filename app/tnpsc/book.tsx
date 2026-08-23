import { StyleSheet, View, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { router } from 'expo-router';

import { useTheme } from '@/contexts/theme-context';
import { ThemedText } from '@/components/themed-text';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

const GENERAL_KNOWLEDGE_UNITS = [
  { id: 'gk-1', title: 'Unit 1', icon: '🔬' },
  { id: 'gk-2', title: 'Unit 2', icon: '📰' },
  { id: 'gk-3', title: 'Unit 3', icon: '🌍' },
  { id: 'gk-4', title: 'Unit 4', icon: '🏛️' },
  { id: 'gk-5', title: 'Unit 5', icon: '⚖️' },
  { id: 'gk-6', title: 'Unit 6', icon: '📊' },
  { id: 'gk-7', title: 'Unit 7', icon: '🇮🇳' },
  { id: 'gk-8', title: 'Unit 8', icon: '🧠' },
];

const TAMIL_UNITS = [
  { id: 'tamil-1', title: 'அலகு:1 இலக்கணம் (25 வினாக்கள்)', icon: '📖' },
  { id: 'tamil-2', title: 'அலகு :2 சொல்லகராதி (15 வினாக்கள்)', icon: '📖' },
  { id: 'tamil-3', title: 'அலகு :3 எழுதும் திறன் (15 வினாக்கள்)', icon: '📖' },
  { id: 'tamil-4', title: 'அலகு :4 கலைச்சொற்கள் (10 வினாக்கள்)', icon: '📖' },
  { id: 'tamil-5', title: 'அலகு :5 வாசித்தல்- புரிந்து கொள்ளும் திறன் (15 வினாக்கள்)', icon: '📖' },
  { id: 'tamil-6', title: 'அலகு :6 எளிய மொழிபெயர்ப்பு (5 வினாக்கள்)', icon: '📖' },
  { id: 'tamil-7', title: 'அலகு :7 இலக்கியம், தமிழ் அறிஞர்களும், தமிழ் தொண்டும் (15 வினாக்கள்)', icon: '📖' },
];

export default function BookScreen() {
  const { colors } = useTheme();

  const handleBack = () => router.back();
  const handleUnitPress = (id: string, title: string) => {
    console.log(`Book - Unit ${id}: ${title}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />
      <View style={styles.statusBarSpace} />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={[styles.backButton, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.backIcon, { color: colors.text }]}>←</ThemedText>
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Book (Group 1 to 5)</ThemedText>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.infoTitle, { color: colors.text }]}>Book (Group 1 to 5)</ThemedText>
          <ThemedText style={[styles.infoSubtitle, { color: colors.textSecondary }]}>General Knowledge & Tamil — Select a unit to study</ThemedText>
        </View>

        {/* General Knowledge */}
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>1. General Knowledge</ThemedText>
        </View>
        <View style={styles.menuContainer}>
          {GENERAL_KNOWLEDGE_UNITS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuCard, { backgroundColor: colors.card }]}
              onPress={() => handleUnitPress(item.id, item.title)}
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

        {/* Tamil */}
        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>2. Tamil</ThemedText>
        </View>
        <View style={styles.menuContainer}>
          {TAMIL_UNITS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuCard, { backgroundColor: colors.card }]}
              onPress={() => handleUnitPress(item.id, item.title)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
                <ThemedText style={styles.menuIcon}>{item.icon}</ThemedText>
              </View>
              <View style={styles.menuTextContainer}>
                <ThemedText style={[styles.menuTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</ThemedText>
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
