import { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/contexts/theme-context';

export function AppCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { colors } = useTheme();
  return <View style={[styles.card, { backgroundColor: colors.card }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
  },
});
