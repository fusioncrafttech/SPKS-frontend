import { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';

import { useTheme } from '@/contexts/theme-context';
import { ThemedText } from '@/components/themed-text';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export default function ProgressScreen() {
  const { colors } = useTheme();
  const progressData = [
    { id: '1', course: 'TNPSC', completed: 45, total: 100, color: colors.gradient1[0] },
    { id: '2', course: 'RRB', completed: 30, total: 80, color: colors.gradient2[0] },
    { id: '3', course: 'TNUSRB', completed: 60, total: 120, color: colors.gradient3[0] },
    { id: '4', course: 'Current Affairs', completed: 25, total: 50, color: colors.gradient4[0] },
  ];

  const [selectedState, setSelectedState] = useState('Tamil Nadu');
  const [showStateModal, setShowStateModal] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const selectState = (state: string) => {
    setSelectedState(state);
    setShowStateModal(false);
  };

  const totalCompleted = progressData.reduce((sum, item) => sum + item.completed, 0);
  const totalQuestions = progressData.reduce((sum, item) => sum + item.total, 0);
  const overallProgress = Math.round((totalCompleted / totalQuestions) * 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />
      <View style={styles.statusBarSpace} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={[styles.backButton, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.backIcon, { color: colors.text }]}>←</ThemedText>
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: colors.text }]}>My Progress</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* State Dropdown */}
        <View style={styles.dropdownSection}>
          <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>Select Your State</ThemedText>
          <TouchableOpacity
            style={[styles.dropdown, { backgroundColor: colors.card }]}
            onPress={() => setShowStateModal(true)}
            activeOpacity={0.8}
          >
            <ThemedText style={[styles.dropdownText, { color: colors.text }]}>{selectedState}</ThemedText>
            <ThemedText style={[styles.dropdownArrow, { color: colors.textMuted }]}>▼</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Overall Progress */}
        <View style={[styles.overallCard, { backgroundColor: colors.tint }]}>
          <View style={styles.overallHeader}>
            <ThemedText style={styles.overallTitle}>Overall Progress</ThemedText>
            <ThemedText style={styles.overallPercent}>{overallProgress}%</ThemedText>
          </View>
          <View style={styles.overallBar}>
            <View style={[styles.overallFill, { width: `${overallProgress}%` }]} />
          </View>
          <ThemedText style={styles.overallSubtext}>
            {totalCompleted} of {totalQuestions} questions completed
          </ThemedText>
        </View>

        {/* Course Progress */}
        <ThemedText style={[styles.coursesTitle, { color: colors.text }]}>Course-wise Progress</ThemedText>
        
        {progressData.map((item) => {
          const percent = Math.round((item.completed / item.total) * 100);
          return (
            <View key={item.id} style={[styles.courseCard, { backgroundColor: colors.card }]}>
              <View style={styles.courseHeader}>
                <View style={[styles.courseIcon, { backgroundColor: item.color }]}>
                  <ThemedText style={styles.courseInitial}>
                    {item.course.charAt(0)}
                  </ThemedText>
                </View>
                <View style={styles.courseInfo}>
                  <ThemedText style={[styles.courseName, { color: colors.text }]}>{item.course}</ThemedText>
                  <ThemedText style={[styles.courseStats, { color: colors.textSecondary }]}>
                    {item.completed}/{item.total} completed
                  </ThemedText>
                </View>
                <ThemedText style={[styles.coursePercent, { color: item.color }]}>
                  {percent}%
                </ThemedText>
              </View>
              <View style={[styles.courseBar, { backgroundColor: colors.inputBg }]}>
                <View
                  style={[
                    styles.courseFill,
                    { width: `${percent}%`, backgroundColor: item.color },
                  ]}
                />
              </View>
            </View>
          );
        })}

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.statValue, { color: colors.tint }]}>156</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Quizzes Taken</ThemedText>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.statValue, { color: colors.tint }]}>89%</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Avg. Score</ThemedText>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.statValue, { color: colors.tint }]}>12</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* State Selection Modal */}
      <Modal
        visible={showStateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Select State</ThemedText>
              <TouchableOpacity onPress={() => setShowStateModal(false)}>
                <ThemedText style={[styles.modalClose, { color: colors.textSecondary }]}>✕</ThemedText>
              </TouchableOpacity>
            </View>
            <FlatList
              data={INDIAN_STATES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.stateItem,
                    { borderBottomColor: colors.border },
                    selectedState === item && { backgroundColor: colors.background },
                  ]}
                  onPress={() => selectState(item)}
                >
                  <ThemedText
                    style={[
                      styles.stateText,
                      { color: selectedState === item ? colors.tint : colors.text },
                      selectedState === item && styles.stateTextSelected,
                    ]}
                  >
                    {item}
                  </ThemedText>
                  {selectedState === item && (
                    <ThemedText style={[styles.checkmark, { color: colors.tint }]}>✓</ThemedText>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
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
  dropdownSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownArrow: {
    fontSize: 12,
  },
  overallCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  overallTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  overallPercent: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  overallBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  overallFill: {
    height: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  overallSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  coursesTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  courseCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courseInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
  },
  courseStats: {
    fontSize: 12,
  },
  coursePercent: {
    fontSize: 18,
    fontWeight: '700',
  },
  courseBar: {
    height: 6,
    borderRadius: 3,
  },
  courseFill: {
    height: 6,
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalClose: {
    fontSize: 20,
  },
  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  stateText: {
    fontSize: 16,
  },
  stateTextSelected: {
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
  },
});
