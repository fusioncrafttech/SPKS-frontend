import { Stack } from 'expo-router';

export default function CurrentAffairsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="day-wise" />
      <Stack.Screen name="test" />
      <Stack.Screen name="video" />
    </Stack>
  );
}
