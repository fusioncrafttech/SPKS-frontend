import { Redirect, Stack, usePathname } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { postAuthHref } from '@/lib/premium';

export default function AuthLayout() {
  const { isLoggedIn, isReady, hasActiveSubscription } = useAuth();
  const { colors } = useTheme();
  const pathname = usePathname();

  if (isReady && isLoggedIn && !pathname.includes('reset-password')) {
    return <Redirect href={postAuthHref(hasActiveSubscription) as any} />;
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
