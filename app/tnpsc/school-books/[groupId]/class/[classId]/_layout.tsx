import { Stack } from 'expo-router';

import { useTheme } from '@/contexts/theme-context';

export default function ClassLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
