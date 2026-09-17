import { Stack } from 'expo-router';

import { useTheme } from '@/contexts/theme-context';

export default function CurrentAffairsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="day-wise" />
      <Stack.Screen name="test" />
      <Stack.Screen name="video" />
    </Stack>
  );
}
