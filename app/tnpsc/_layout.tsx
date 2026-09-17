import { Stack } from 'expo-router';

import { useTheme } from '@/contexts/theme-context';

export default function TNPSCLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="book" />
      <Stack.Screen name="outside-source" />
      <Stack.Screen name="test" />
      <Stack.Screen name="group/[id]" />
      <Stack.Screen name="school-books" />
    </Stack>
  );
}
