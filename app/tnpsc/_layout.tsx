import { Stack } from 'expo-router';

export default function TNPSCLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="book" />
      <Stack.Screen name="outside-source" />
      <Stack.Screen name="test" />
    </Stack>
  );
}
