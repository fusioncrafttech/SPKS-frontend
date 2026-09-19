import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import type { IonName } from '@/constants/brand';
import { APP_NAME } from '@/constants/brand';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { api } from '@/lib/api';
import { mapProfile } from '@/lib/auth';
import { formatSubscriptionDate, subscriptionEndsAt } from '@/lib/payments';

const LIST_ITEMS: { id: string; title: string; icon: IonName; route: string }[] = [
  { id: 'progress', title: 'Progress', icon: 'trending-up-outline', route: '/profile/progress' },
  { id: 'history', title: 'Test history', icon: 'create-outline', route: '/profile/test-history' },
  { id: 'plans', title: 'Plans', icon: 'diamond-outline', route: '/(tabs)/price' },
  { id: 'payments', title: 'Payments', icon: 'card-outline', route: '/profile/payments' },
  { id: 'help', title: 'Support', icon: 'chatbubbles-outline', route: '/profile/help' },
  { id: 'settings', title: 'Settings', icon: 'options-outline', route: '/profile/settings' },
  { id: 'edit', title: 'Personal details', icon: 'person-outline', route: '/profile/edit' },
  { id: 'terms', title: 'Terms & privacy', icon: 'shield-outline', route: '/profile/terms' },
];

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string | null;
}

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const { user, logout, refreshUser, hasActiveSubscription, subscription } = useAuth();
  const mapped = mapProfile(user);
  const [profile, setProfile] = useState<ProfileData>({
    firstName: mapped?.firstName || '',
    lastName: mapped?.lastName || '',
    email: mapped?.email || '',
    phone: mapped?.phone || '',
    profileImage: mapped?.profileImage || null,
  });
  const [stats, setStats] = useState({ testsCompleted: 0, questionsAttempted: 0, averageScore: 0 });

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [user?.id])
  );

  useEffect(() => {
    api.get<{ testsCompleted?: number; questionsAttempted?: number; averageScore?: number }>('/api/users/me/stats')
      .then((data) => {
        if (!data) return;
        setStats({
          testsCompleted: data.testsCompleted || 0,
          questionsAttempted: data.questionsAttempted || 0,
          averageScore: Math.round(data.averageScore || 0),
        });
      })
      .catch(() => undefined);
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      const remoteProfile = await refreshUser();
      const next = mapProfile(remoteProfile);
      if (next) {
        setProfile({
          firstName: next.firstName,
          lastName: next.lastName,
          email: next.email,
          phone: next.phone || '',
          profileImage: next.profileImage,
        });
      }
    } catch {
      if (mapped) {
        setProfile({
          firstName: mapped.firstName,
          lastName: mapped.lastName,
          email: mapped.email,
          phone: mapped.phone || '',
          profileImage: mapped.profileImage,
        });
      }
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/(auth)/login');
          } catch (error) {
            console.log('Error logging out:', error);
          }
        },
      },
    ]);
  };

  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || 'Student';
  const initials = (profile.firstName || profile.email || 'S').charAt(0).toUpperCase();
  const planLabel = subscription?.planName || subscription?.name;
  const endsAtLabel = formatSubscriptionDate(subscriptionEndsAt(subscription));

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <LinearGradient colors={isDark ? ['#0F172A', '#312E81'] : ['#312E81', '#6366F1']} style={styles.cover}>
          <View style={styles.coverGlow} />
          <View style={styles.coverTop}>
            <ThemedText style={styles.coverTitle}>Account</ThemedText>
            <TouchableOpacity style={styles.coverBtn} onPress={() => router.push('/profile/settings')}>
              <Ionicons name="settings-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <View style={styles.avatarWrap}>
              {profile.profileImage ? (
                <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <ThemedText style={styles.avatarText}>{initials}</ThemedText>
                </View>
              )}
            </View>

            <ThemedText style={[styles.name, { color: colors.text }]}>{fullName}</ThemedText>
            <ThemedText style={[styles.email, { color: colors.textSecondary }]}>{profile.email || 'Add your email'}</ThemedText>
            {profile.phone ? (
              <ThemedText style={[styles.email, { color: colors.textSecondary }]}>+91 {profile.phone}</ThemedText>
            ) : null}

            <View style={styles.chipRow}>
              <View style={[styles.chip, { backgroundColor: isDark ? '#312E81' : '#EEF2FF' }]}>
                <Ionicons name="school-outline" size={13} color={isDark ? '#C7D2FE' : '#4338CA'} />
                <ThemedText style={[styles.chipText, { color: isDark ? '#C7D2FE' : '#4338CA' }]}>Exam aspirant</ThemedText>
              </View>
              <View style={[styles.chip, { backgroundColor: hasActiveSubscription ? (isDark ? '#14532D' : '#ECFDF5') : isDark ? '#422006' : '#FFF7ED' }]}>
                <Ionicons name={hasActiveSubscription ? 'diamond' : 'lock-closed-outline'} size={13} color={hasActiveSubscription ? '#059669' : '#EA580C'} />
                <ThemedText style={[styles.chipText, { color: hasActiveSubscription ? '#059669' : '#EA580C' }]}>
                  {hasActiveSubscription
                    ? `${planLabel || 'Premium'}${endsAtLabel ? ` · ${endsAtLabel}` : ''}`
                    : 'No active plan'}
                </ThemedText>
              </View>
            </View>

            <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/profile/edit')} activeOpacity={0.85}>
              <Ionicons name="pencil-outline" size={16} color="#FFFFFF" />
              <ThemedText style={styles.editBtnText}>Edit profile</ThemedText>
            </TouchableOpacity>

            <View style={[styles.statBar, { backgroundColor: isDark ? colors.inputBg : colors.background }]}>
              <View style={styles.statCell}>
                <ThemedText style={[styles.statValue, { color: colors.text }]}>{stats.testsCompleted}</ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Tests</ThemedText>
              </View>
              <View style={[styles.statSplit, { backgroundColor: colors.border }]} />
              <View style={styles.statCell}>
                <ThemedText style={[styles.statValue, { color: colors.text }]}>{stats.questionsAttempted}</ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Questions</ThemedText>
              </View>
              <View style={[styles.statSplit, { backgroundColor: colors.border }]} />
              <View style={styles.statCell}>
                <ThemedText style={[styles.statValue, { color: colors.text }]}>{stats.averageScore}%</ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Score</ThemedText>
              </View>
            </View>
          </View>

          <View style={[styles.listCard, { backgroundColor: colors.card }]}>
            {LIST_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.listRow, index < LIST_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.8}
              >
                <Ionicons name={item.icon} size={18} color={colors.textSecondary} />
                <ThemedText style={[styles.listTitle, { color: colors.text }]}>{item.title}</ThemedText>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={handleLogout} style={styles.logout} activeOpacity={0.8}>
            <ThemedText style={[styles.logoutText, { color: colors.danger }]}>Sign out of this account</ThemedText>
          </TouchableOpacity>
          <ThemedText style={[styles.version, { color: colors.textMuted }]}>{APP_NAME} 1.1.0</ThemedText>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 36,
  },
  cover: {
    height: 150,
    paddingHorizontal: 20,
    paddingTop: 8,
    overflow: 'hidden',
  },
  coverGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.12)',
    right: -30,
    top: -40,
  },
  coverTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coverTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  coverBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 20,
  },
  sheet: {
    marginTop: -58,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 18,
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'absolute',
    top: -42,
    alignSelf: 'center',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarFallback: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontSize: 13,
    textAlign: 'center',
  },
  chipRow: {
    marginTop: 10,
    marginBottom: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4338CA',
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 999,
    marginBottom: 16,
  },
  editBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  statBar: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: 16,
    paddingVertical: 12,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statSplit: {
    width: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  listCard: {
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  listTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  logout: {
    alignItems: 'center',
    marginTop: 22,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 10,
  },
});
