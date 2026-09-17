import { Stack } from 'expo-router';

import { useTheme } from '@/contexts/theme-context';

export default function ProfileLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="edit" />
      <Stack.Screen name="progress" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="help" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="payments" />
      <Stack.Screen name="test-history" />
      <Stack.Screen name="support" />
    </Stack>
  );
}
