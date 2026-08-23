import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { api } from '@/lib/api';
import { mapProfile } from '@/lib/auth';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

const menuItems = [
  { id: '1', icon: '👤', title: 'Edit Profile', subtitle: 'Update your personal details', route: '/profile/edit' },
  { id: '2', icon: '📊', title: 'My Progress', subtitle: 'View your learning stats', route: '/profile/progress' },
  { id: '3', icon: '⚙️', title: 'Settings', subtitle: 'App preferences', route: '/profile/settings' },
  { id: '4', icon: '❓', title: 'Help & Support', subtitle: 'Get help or contact us', route: '/profile/help' },
  { id: '5', icon: '📜', title: 'Terms & Privacy', subtitle: 'Read our policies', route: '/profile/terms' },
];

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string | null;
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, logout, refreshUser } = useAuth();
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

  const handleMenuPress = (route: string) => {
    router.push(route as any);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
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
      ]
    );
  };

  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || 'Student';
  const initials = (profile.firstName || profile.email || 'S').charAt(0).toUpperCase();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />
      <View style={styles.statusBarSpace} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {profile.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
                <ThemedText style={styles.avatarText}>{initials}</ThemedText>
              </View>
            )}
            <TouchableOpacity 
              style={[styles.editBadge, { backgroundColor: colors.card }]}
              onPress={() => handleMenuPress('/profile/edit')}
            >
              <ThemedText style={styles.editIcon}>✏️</ThemedText>
            </TouchableOpacity>
          </View>
          <ThemedText style={[styles.userName, { color: colors.text }]}>{fullName}</ThemedText>
          <ThemedText style={[styles.userEmail, { color: colors.textSecondary }]}>{profile.email}</ThemedText>
          <ThemedText style={[styles.userPhone, { color: colors.textSecondary }]}>+91 {profile.phone}</ThemedText>
        </View>

        {/* Stats */}
        <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
          <View style={styles.statBox}>
            <ThemedText style={[styles.statValue, { color: colors.tint }]}>{stats.testsCompleted}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Tests</ThemedText>
          </View>
          <View style={styles.statBox}>
            <ThemedText style={[styles.statValue, { color: colors.tint }]}>{stats.questionsAttempted}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Questions</ThemedText>
          </View>
          <View style={styles.statBox}>
            <ThemedText style={[styles.statValue, { color: colors.tint }]}>{stats.averageScore}%</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Score</ThemedText>
          </View>
        </View>

        {/* Menu Items */}
        <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.menuItem, { borderBottomColor: colors.border }]} 
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item.route)}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
                <ThemedText style={styles.menuIcon}>{item.icon}</ThemedText>
              </View>
              <View style={styles.menuTextContainer}>
                <ThemedText style={[styles.menuTitle, { color: colors.text }]}>{item.title}</ThemedText>
                <ThemedText style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</ThemedText>
              </View>
              <ThemedText style={[styles.menuArrow, { color: colors.textMuted }]}>›</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.danger }]} 
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </TouchableOpacity>

        {/* Version */}
        <ThemedText style={[styles.version, { color: colors.textMuted }]}>Version 1.0.0</ThemedText>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editIcon: {
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#8e8e93',
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  menuContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
  },
  menuArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
  logoutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
  },
});
