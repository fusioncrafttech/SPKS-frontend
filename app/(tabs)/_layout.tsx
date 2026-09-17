import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';

export default function TabLayout() {
  const { colors } = useTheme();
  const { isReady, isLoggedIn } = useAuth();

  if (isReady && !isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: [styles.tabBar, { backgroundColor: colors.tabBar, borderTopColor: colors.border }],
        tabBarLabelStyle: styles.tabLabel,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="price"
        options={{
          title: 'Plans',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'diamond' : 'diamond-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    elevation: 16,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
