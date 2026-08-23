import { StyleSheet, View, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

const GROUP_NAMES: Record<string, string> = {
  '1': 'Group 1',
  '2': 'Group 2',
  '3': 'Group 3',
  '4': 'Group 4',
  '5': 'Others',
};

const groupItems = [
  { id: '1', title: 'School Books', icon: '📖', gradientColors: ['#667eea', '#764ba2'] as [string, string] },
  { id: '2', title: 'Outside source', icon: '📚', gradientColors: ['#f093fb', '#f5576c'] as [string, string] },
  { id: '3', title: 'Video Explanations', icon: '🎬', gradientColors: ['#4facfe', '#00f2fe'] as [string, string] },
  { id: '4', title: 'Test', icon: '📝', gradientColors: ['#43e97b', '#38f9d7'] as [string, string] },
];

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupName = id ? GROUP_NAMES[id] || `Group ${id}` : 'Group';

  const handleItemPress = (itemId: string, title: string) => {
    if (itemId === '1' && title === 'School Books' && id) {
      router.push(`/tnpsc/school-books/${id}`);
      return;
    }
    console.log(`Selected: ${groupName} - ${title}`);
    // TODO: Navigate to Outside source, Video Explanations, Test pages
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.statusBarSpace} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ThemedText style={styles.backIcon}>←</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{groupName}</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Group Info */}
        <View style={styles.infoCard}>
          <ThemedText style={styles.infoTitle}>{groupName}</ThemedText>
          <ThemedText style={styles.infoSubtitle}>Choose a category to continue</ThemedText>
        </View>

        {/* Menu Items: School Books, Outside source, Video Explanations, Test */}
        <View style={styles.menuContainer}>
          {groupItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => handleItemPress(item.id, item.title)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={item.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.menuGradient}
              >
                <View style={styles.menuIconContainer}>
                  <ThemedText style={styles.menuIcon}>{item.icon}</ThemedText>
                </View>
                <View style={styles.menuTextContainer}>
                  <ThemedText style={styles.menuTitle}>{item.title}</ThemedText>
                </View>
                <View style={styles.menuArrowContainer}>
                  <ThemedText style={styles.menuArrow}>→</ThemedText>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  statusBarSpace: {
    height: STATUSBAR_HEIGHT,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backIcon: {
    fontSize: 20,
    color: '#1a1a2e',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
  },
  menuContainer: {
    gap: 16,
  },
  menuCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  menuGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuIcon: {
    fontSize: 24,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  menuArrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuArrow: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
