import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CourseCard } from '@/components/ui/course-card';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { api } from '@/lib/api';
import { courseRoute, listCourses } from '@/lib/catalog';

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

const courseIcon = (title: string) => {
  const key = title.toLowerCase();
  if (key.includes('rrb')) return <RRBIcon />;
  if (key.includes('tnusrb')) return <TNUSRBIcon />;
  if (key.includes('current')) return <CurrentAffairsIcon />;
  return <TNPSCIcon />;
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const fallbackCourses = [
    { id: '1', title: 'TNPSC', subtitle: 'Tamil Nadu Public Service', icon: <TNPSCIcon />, route: '/tnpsc' as const },
    { id: '2', title: 'RRB', subtitle: 'Transport Corporation', icon: <RRBIcon />, route: '/rrb' as const },
    { id: '3', title: 'TNUSRB', subtitle: 'Police Recruitment', icon: <TNUSRBIcon />, route: '/tnusrb' as const },
    { id: '4', title: 'Current Affairs', subtitle: 'Daily Updates & News', icon: <CurrentAffairsIcon />, route: '/current-affairs' as const },
  ];
  const [courses, setCourses] = useState(fallbackCourses);
  const [stats, setStats] = useState({ dailyStreak: 0, testsCompleted: 0, averageScore: 0 });

  useEffect(() => {
    listCourses()
      .then((items) => {
        if (!items.length) return;
        setCourses(items.map((item) => {
          const title = item.name || item.title || 'Course';
          return {
            id: item.id,
            title,
            subtitle: item.description || item.subtitle || '',
            icon: courseIcon(title),
            route: courseRoute(item) || '/tnpsc',
          };
        }));
      })
      .catch(() => undefined);

    api.get<{ dailyStreak?: number; testsCompleted?: number; averageScore?: number }>('/api/users/me/stats')
      .then((data) => {
        if (!data) return;
        setStats({
          dailyStreak: data.dailyStreak || 0,
          testsCompleted: data.testsCompleted || 0,
          averageScore: Math.round(data.averageScore || 0),
        });
      })
      .catch(() => undefined);
  }, [user?.id]);

  const handleCoursePress = (route: string) => {
    router.push(route as any);
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
            <ThemedText style={[styles.statNumber, { color: colors.tint }]}>{stats.dailyStreak}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Daily Streak</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: colors.tint }]}>{stats.testsCompleted}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Tests Done</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: colors.tint }]}>{stats.averageScore}%</ThemedText>
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
              onPress={() => handleCoursePress(course.route)}
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
