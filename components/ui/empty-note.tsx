import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';

export function EmptyNote({ title, message }: { title: string; message: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <ThemedText style={[styles.title, { color: colors.text }]}>{title}</ThemedText>
      <ThemedText style={[styles.message, { color: colors.textSecondary }]}>{message}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 20 },
  title: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  message: { fontSize: 14, lineHeight: 20 },
});
