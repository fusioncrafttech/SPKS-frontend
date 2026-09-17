import { Redirect, Stack, usePathname } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';

export default function AuthLayout() {
  const { isLoggedIn, isReady } = useAuth();
  const { colors } = useTheme();
  const pathname = usePathname();

  if (isReady && isLoggedIn && !pathname.includes('reset-password')) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
