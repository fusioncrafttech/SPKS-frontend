import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { api } from '@/lib/api';
import { courseRoute, listCourses } from '@/lib/catalog';
import { getContinueLearning, getStreak, openContinueItem, type ContinueLearning } from '@/lib/study';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

type CourseVisual = {
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  tag: string;
};

type HomeCourse = {
  id: string;
  title: string;
  subtitle: string;
  route: string;
};

const STUDY_TIPS = [
  'One timed mock every week beats hours of unfocused reading.',
  'Write five current-affairs points by hand. They stick longer.',
  'Revise yesterday’s mistakes before starting a new chapter.',
  'Short sessions with a timer keep accuracy higher in the exam.',
];

const QUICK_ACTIONS = [
  { id: 'test', label: 'Mock test', icon: 'create-outline' as const, route: '/tnpsc/test' },
  { id: 'news', label: 'Daily news', icon: 'newspaper-outline' as const, route: '/current-affairs/day-wise' },
  { id: 'notes', label: 'Notes', icon: 'book-outline' as const, route: '/tnpsc/book' },
  { id: 'plans', label: 'Plans', icon: 'diamond-outline' as const, route: '/(tabs)/price' },
];

function courseVisual(title?: string): CourseVisual {
  const key = (title || '').toLowerCase();
  if (key.includes('rrb')) {
    return { icon: 'bus', gradient: ['#0F766E', '#14B8A6'], tag: 'Transport' };
  }
  if (key.includes('tnusrb')) {
    return { icon: 'shield-checkmark', gradient: ['#1E3A8A', '#3B82F6'], tag: 'Police' };
  }
  if (key.includes('current')) {
    return { icon: 'newspaper', gradient: ['#C2410C', '#F97316'], tag: 'Daily' };
  }
  return { icon: 'library', gradient: ['#4338CA', '#7C3AED'], tag: 'Govt exams' };
}

function ExamTile({ course, onPress }: { course: HomeCourse; onPress: () => void }) {
  const visual = courseVisual(course.title);

  return (
    <TouchableOpacity style={styles.examCardWrap} onPress={onPress} activeOpacity={0.88}>
      <LinearGradient
        colors={visual.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.examCard}
      >
        <View style={styles.examIconWrap}>
          <Ionicons name={visual.icon} size={22} color="#FFFFFF" />
        </View>
        <View style={styles.examTag}>
          <ThemedText style={styles.examTagText}>{visual.tag}</ThemedText>
        </View>
        <ThemedText style={styles.examTitle} numberOfLines={1}>
          {course.title}
        </ThemedText>
        <ThemedText style={styles.examSubtitle} numberOfLines={2}>
          {course.subtitle}
        </ThemedText>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatToday() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

const fallbackCourses: HomeCourse[] = [
  {
    id: '1',
    title: 'TNPSC',
    subtitle: 'Tamil Nadu Public Service',
    route: '/tnpsc',
  },
  {
    id: '2',
    title: 'RRB',
    subtitle: 'Railway Recruitment',
    route: '/rrb',
  },
  {
    id: '3',
    title: 'TNUSRB',
    subtitle: 'Police Recruitment',
    route: '/tnusrb',
  },
  {
    id: '4',
    title: 'Current Affairs',
    subtitle: 'Daily updates & news',
    route: '/current-affairs',
  },
];

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [courses, setCourses] = useState<HomeCourse[]>(fallbackCourses);
  const [stats, setStats] = useState({ dailyStreak: 0, testsCompleted: 0, averageScore: 0 });
  const [continueItem, setContinueItem] = useState<ContinueLearning | null>(null);

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Student';
  const initials = firstName.charAt(0).toUpperCase();
  const greeting = greetingForHour(new Date().getHours());
  const todayLabel = formatToday();
  const tip = STUDY_TIPS[new Date().getDate() % STUDY_TIPS.length];
  const continueRoute = courses[0]?.route || '/tnpsc';

  const courseRows = useMemo(() => {
    const rows: HomeCourse[][] = [];
    for (let i = 0; i < courses.length; i += 2) {
      rows.push(courses.slice(i, i + 2));
    }
    return rows;
  }, [courses]);

  useEffect(() => {
    listCourses()
      .then((items) => {
        if (!items.length) return;
        setCourses(
          items.map((item) => {
            const title = item.name || item.title || 'Course';
            return {
              id: item.id,
              title,
              subtitle: item.description || item.subtitle || '',
              route: courseRoute(item) || '/tnpsc',
            };
          })
        );
      })
      .catch(() => undefined);

    api
      .get<{ dailyStreak?: number; testsCompleted?: number; averageScore?: number }>('/api/users/me/stats')
      .then((data) => {
        if (!data) return;
        setStats({
          dailyStreak: data.dailyStreak || 0,
          testsCompleted: data.testsCompleted || 0,
          averageScore: Math.round(data.averageScore || 0),
        });
      })
      .catch(() => undefined);

    getStreak().then((streak) => {
      if (streak) setStats((current) => ({ ...current, dailyStreak: streak }));
    });
    getContinueLearning().then(setContinueItem);
  }, [user?.id]);

  const openRoute = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />
      <View style={styles.statusBarSpace} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.greetingBlock}>
            <ThemedText style={[styles.dateText, { color: colors.textSecondary }]}>{todayLabel}</ThemedText>
            <ThemedText style={[styles.greeting, { color: colors.text }]}>
              {greeting}, {firstName}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.avatarButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => openRoute('/(tabs)/profile')}
            activeOpacity={0.8}
          >
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: isDark ? '#312E81' : '#4338CA' }]}>
                <ThemedText style={styles.avatarInitial}>{initials}</ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={isDark ? ['#1E1B4B', '#312E81'] : ['#1E1B4B', '#4338CA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroGlow} />
          <View style={styles.heroTop}>
            <View style={styles.streakChip}>
              <Ionicons name="flame" size={14} color="#FDBA74" />
              <ThemedText style={styles.streakChipText}>
                {stats.dailyStreak} day streak
              </ThemedText>
            </View>
            <ThemedText style={styles.heroEyebrow}>Keep the momentum</ThemedText>
          </View>
          <ThemedText style={styles.heroTitle}>
            {continueItem?.title ? `Continue: ${continueItem.title}` : 'Ready for today’s revision?'}
          </ThemedText>
          <ThemedText style={styles.heroSubtitle}>{continueItem?.courseName || tip}</ThemedText>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={async () => {
              const opened = await openContinueItem(continueItem);
              if (!opened) openRoute(continueRoute);
            }}
            activeOpacity={0.85}
          >
            <ThemedText style={styles.heroButtonText}>Continue learning</ThemedText>
            <Ionicons name="arrow-forward" size={16} color="#1E1B4B" />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconWrap, { backgroundColor: isDark ? '#422006' : '#FFF7ED' }]}>
              <Ionicons name="flame-outline" size={18} color="#EA580C" />
            </View>
            <ThemedText style={[styles.statValue, { color: colors.text }]}>{stats.dailyStreak}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Streak</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconWrap, { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF' }]}>
              <Ionicons name="checkmark-done-outline" size={18} color="#2563EB" />
            </View>
            <ThemedText style={[styles.statValue, { color: colors.text }]}>{stats.testsCompleted}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Tests</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconWrap, { backgroundColor: isDark ? '#14532D' : '#ECFDF5' }]}>
              <Ionicons name="trophy-outline" size={18} color="#059669" />
            </View>
            <ThemedText style={[styles.statValue, { color: colors.text }]}>{stats.averageScore}%</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Accuracy</ThemedText>
          </View>
        </View>

        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Choose your exam</ThemedText>
        <ThemedText style={[styles.sectionHint, { color: colors.textSecondary }]}>
          Books, tests and videos for each recruitment
        </ThemedText>

        {courseRows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.examRow}>
            {row.map((course) => (
              <ExamTile
                key={course.id}
                course={course}
                onPress={() => openRoute(course.route)}
              />
            ))}
            {row.length === 1 ? <View style={styles.examCardWrap} /> : null}
          </View>
        ))}

        <ThemedText style={[styles.sectionTitle, { color: colors.text, marginTop: 8 }]}>Quick start</ThemedText>
        <View style={styles.quickRow}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickCard, { backgroundColor: colors.card }]}
              onPress={() => openRoute(action.route)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIcon, { backgroundColor: isDark ? '#312E81' : '#EEF2FF' }]}>
                <Ionicons name={action.icon} size={20} color={isDark ? '#C7D2FE' : '#4338CA'} />
              </View>
              <ThemedText style={[styles.quickLabel, { color: colors.text }]}>{action.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.affairsBanner, { backgroundColor: colors.card }]}
          onPress={() => openRoute('/current-affairs')}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#C2410C', '#EA580C']} style={styles.affairsIcon}>
            <Ionicons name="globe-outline" size={22} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.affairsCopy}>
            <ThemedText style={[styles.affairsTitle, { color: colors.text }]}>Today’s current affairs</ThemedText>
            <ThemedText style={[styles.affairsSubtitle, { color: colors.textSecondary }]}>
              State, India and world updates with tests
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
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
    paddingTop: 12,
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greetingBlock: {
    flex: 1,
    paddingRight: 12,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  avatarButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    borderWidth: 1,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
    right: -40,
    top: -50,
  },
  heroTop: {
    marginBottom: 12,
  },
  streakChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  streakChipText: {
    color: '#FDE68A',
    fontSize: 12,
    fontWeight: '700',
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  heroButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  heroButtonText: {
    color: '#1E1B4B',
    fontSize: 14,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionHint: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 14,
  },
  examRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  examCardWrap: {
    flex: 1,
  },
  examCard: {
    minHeight: 168,
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
  },
  examIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  examTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 8,
  },
  examTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  examTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  examSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    lineHeight: 16,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    marginBottom: 18,
  },
  quickCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 8,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  affairsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  affairsIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  affairsCopy: {
    flex: 1,
  },
  affairsTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  affairsSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
});
