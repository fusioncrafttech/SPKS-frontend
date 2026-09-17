import { Stack } from 'expo-router';

import { useTheme } from '@/contexts/theme-context';

export default function GroupBooksLayout() {
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
