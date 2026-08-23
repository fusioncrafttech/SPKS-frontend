import { Stack } from 'expo-router';

export default function RRBLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="notes" />
      <Stack.Screen name="test" />
      <Stack.Screen name="video" />
    </Stack>
  );
}
