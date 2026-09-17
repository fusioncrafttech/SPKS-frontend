import { Stack } from 'expo-router';

import { useTheme } from '@/contexts/theme-context';

export default function TNUSRBLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="notes" />
      <Stack.Screen name="test" />
      <Stack.Screen name="video" />
      <Stack.Screen name="group/[id]" />
    </Stack>
  );
}
