import { router } from 'expo-router';
import { Platform, ScrollView, StatusBar, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CourseCard } from '@/components/ui/course-card';
import { useTheme } from '@/contexts/theme-context';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

// Modern minimalist icons
const TNPSCIcon = () => (
  <View style={styles.iconInner}>
    <ThemedText style={styles.iconText}>📚</ThemedText>
  </View>
);

const RRBIcon = () => (
  <View style={styles.iconInner}>
    <ThemedText style={styles.iconText}>🚌</ThemedText>
  </View>
);

const TNUSRBIcon = () => (
  <View style={styles.iconInner}>
    <ThemedText style={styles.iconText}>👮</ThemedText>
  </View>
);

const CurrentAffairsIcon = () => (
  <View style={styles.iconInner}>
    <ThemedText style={styles.iconText}>🌐</ThemedText>
  </View>
);

export default function HomeScreen() {
  const { colors } = useTheme();

  const courses = [
    { id: '1', title: 'TNPSC', subtitle: 'Tamil Nadu Public Service', icon: <TNPSCIcon /> },
    { id: '2', title: 'RRB', subtitle: 'Transport Corporation', icon: <RRBIcon /> },
    { id: '3', title: 'TNUSRB', subtitle: 'Police Recruitment', icon: <TNUSRBIcon /> },
    { id: '4', title: 'Current Affairs', subtitle: 'Daily Updates & News', icon: <CurrentAffairsIcon /> },
  ];

  const handleCoursePress = (courseId: string, courseTitle: string) => {
    // Navigate to respective course pages
    if (courseId === '1') {
      router.push('/tnpsc');
    } else if (courseId === '2') {
      router.push('/rrb');
    } else if (courseId === '3') {
      router.push('/tnusrb');
    } else if (courseId === '4') {
      router.push('/current-affairs');
    } else {
      console.log(`Selected course: ${courseTitle}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Status Bar Area - Empty space for time, battery, etc. */}
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />
      <View style={styles.statusBarSpace} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Stats Card */}
        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: colors.tint }]}>5</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Daily Streak</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: colors.tint }]}>12</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Courses Done</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: colors.tint }]}>89%</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Accuracy</ThemedText>
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Popular Courses</ThemedText>
          <ThemedText style={[styles.seeAll, { color: colors.tint }]}>See All</ThemedText>
        </View>

        {/* Course Cards - white card, black text (profile page style) */}
        <View style={styles.courseList}>
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              title={course.title}
              subtitle={course.subtitle}
              icon={course.icon}
              onPress={() => handleCoursePress(course.id, course.title)}
            />
          ))}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  courseList: {
    gap: 0,
  },
  iconInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 28,
  },
});
