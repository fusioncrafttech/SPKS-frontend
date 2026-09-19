import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { HeroBanner } from '@/components/ui/hero-banner';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { api, asList } from '@/lib/api';
import { updateProfile } from '@/lib/auth';
import { getActivity, getStreak } from '@/lib/study';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export default function ProgressScreen() {
  const { colors } = useTheme();
  const { user, setUser } = useAuth();
  const fallbackProgress = [
    { id: '1', course: 'TNPSC', completed: 0, total: 1, color: Brand.indigoSoft[0] },
    { id: '2', course: 'RRB', completed: 0, total: 1, color: Brand.teal[0] },
    { id: '3', course: 'TNUSRB', completed: 0, total: 1, color: Brand.blue[0] },
    { id: '4', course: 'Current Affairs', completed: 0, total: 1, color: Brand.orange[0] },
  ];
  const [progressData, setProgressData] = useState(fallbackProgress);
  const [stats, setStats] = useState({ testsCompleted: 0, averageScore: 0, dailyStreak: 0 });
  const [activity, setActivity] = useState<Record<string, any>[]>([]);
  const [selectedState, setSelectedState] = useState(user?.state || 'Tamil Nadu');
  const [showStateModal, setShowStateModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get<Record<string, any>[]>('/api/users/me/course-progress').catch(() => null),
      api.get<{ testsCompleted?: number; averageScore?: number; dailyStreak?: number }>('/api/users/me/stats').catch(() => null),
      api.get<Record<string, any>>('/api/users/me/progress').catch(() => null),
      getStreak(),
      getActivity(),
    ]).then(([courseProgress, statsData, overall, streak, activityItems]) => {
      if (cancelled) return;
      const list = asList(courseProgress);
      if (list.length) {
        setProgressData(list.map((item, index) => ({
          id: String(item.id || item.courseId || index),
          course: item.course || item.courseName || item.name || 'Course',
          completed: Number(item.completed ?? item.completedLessons ?? item.correctCount ?? 0),
          total: Number(item.total ?? item.totalLessons ?? item.totalQuestions ?? 1) || 1,
          color: [Brand.indigoSoft[0], Brand.teal[0], Brand.blue[0], Brand.orange[0]][index % 4],
        })));
      }
      setStats({
        testsCompleted: Number(overall?.testsCompleted ?? statsData?.testsCompleted ?? 0),
        averageScore: Math.round(Number(overall?.averageScore ?? statsData?.averageScore ?? 0)),
        dailyStreak: Number(streak || overall?.dailyStreak || statsData?.dailyStreak || 0),
      });
      setActivity(activityItems);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const selectState = async (state: string) => {
    setSelectedState(state);
    setShowStateModal(false);
    try {
      const updated = await updateProfile({ state });
      setUser(updated);
    } catch {
      // Keep the local selection if the API is unavailable.
    }
  };

  const totalCompleted = progressData.reduce((sum, item) => sum + item.completed, 0);
  const totalQuestions = progressData.reduce((sum, item) => sum + item.total, 0);
  const overallProgress = Math.round((totalCompleted / totalQuestions) * 100);

  return (
    <Screen>
      <PageHeader title="My Progress" />
      <ScreenScroll>
        {/* State Dropdown */}
        <View style={styles.dropdownSection}>
          <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>Select Your State</ThemedText>
          <TouchableOpacity
            style={[styles.dropdown, { backgroundColor: colors.card }]}
            onPress={() => setShowStateModal(true)}
            activeOpacity={0.8}
          >
            <ThemedText style={[styles.dropdownText, { color: colors.text }]}>{selectedState}</ThemedText>
            <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <HeroBanner
          icon="trophy"
          eyebrow="Progress"
          title={`${overallProgress}% complete`}
          subtitle={`${totalCompleted} of ${totalQuestions} questions completed`}
          gradient={Brand.indigo}
        />

        <SectionHeading title="Course-wise progress" />
        
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
            <ThemedText style={[styles.statValue, { color: colors.tint }]}>{stats.testsCompleted}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Tests Taken</ThemedText>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.statValue, { color: colors.tint }]}>{stats.averageScore}%</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Avg. Score</ThemedText>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.statValue, { color: colors.tint }]}>{stats.dailyStreak}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</ThemedText>
          </View>
        </View>

        {activity.length ? (
          <>
            <SectionHeading title="Recent activity" />
            {activity.slice(0, 8).map((item, index) => (
              <View key={String(item.id || index)} style={[styles.courseCard, { backgroundColor: colors.card }]}>
                <ThemedText style={[styles.courseName, { color: colors.text }]}>
                  {item.title || item.name || item.action || 'Activity'}
                </ThemedText>
                <ThemedText style={[styles.courseStats, { color: colors.textSecondary }]}>
                  {String(item.createdAt || item.date || item.description || '')}
                </ThemedText>
              </View>
            ))}
          </>
        ) : null}
      </ScreenScroll>

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
                <Ionicons name="close" size={18} color={colors.textSecondary} />
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
    </Screen>
  );
}

const styles = StyleSheet.create({
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
