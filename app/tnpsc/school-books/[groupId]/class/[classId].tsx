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

// 8 subjects - same for all classes
const subjects = [
  { id: '1', title: 'Tamil', icon: '📜', gradientColors: ['#667eea', '#764ba2'] as [string, string] },
  { id: '2', title: 'English', icon: '📖', gradientColors: ['#f093fb', '#f5576c'] as [string, string] },
  { id: '3', title: 'Mathematics', icon: '🔢', gradientColors: ['#4facfe', '#00f2fe'] as [string, string] },
  { id: '4', title: 'Science', icon: '🔬', gradientColors: ['#43e97b', '#38f9d7'] as [string, string] },
  { id: '5', title: 'Social Science', icon: '🌍', gradientColors: ['#fa709a', '#fee140'] as [string, string] },
  { id: '6', title: 'History', icon: '📜', gradientColors: ['#a18cd1', '#fbc2eb'] as [string, string] },
  { id: '7', title: 'Geography', icon: '🗺️', gradientColors: ['#667eea', '#764ba2'] as [string, string] },
  { id: '8', title: 'Civics', icon: '⚖️', gradientColors: ['#f093fb', '#f5576c'] as [string, string] },
];

export default function ClassSubjectsScreen() {
  const { groupId, classId } = useLocalSearchParams<{ groupId: string; classId: string }>();
  const groupName = groupId ? GROUP_NAMES[groupId] || `Group ${groupId}` : '';
  const className = classId ? `Class ${classId}` : 'Class';

  const handleSubjectPress = (subjectId: string, title: string) => {
    console.log(`Selected: ${groupName} - ${className} - ${title}`);
    // TODO: Navigate to subject content
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
        <ThemedText style={styles.headerTitle}>{className}</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info */}
        <View style={styles.infoCard}>
          <ThemedText style={styles.infoTitle}>{groupName} - {className}</ThemedText>
          <ThemedText style={styles.infoSubtitle}>Select a subject (8 subjects)</ThemedText>
        </View>

        {/* 8 Subjects */}
        <View style={styles.menuContainer}>
          {subjects.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => handleSubjectPress(item.id, item.title)}
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
    fontSize: 18,
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
