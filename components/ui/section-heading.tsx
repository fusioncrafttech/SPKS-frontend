import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';

type SectionHeadingProps = {
  title: string;
  hint?: string;
};

export function SectionHeading({ title, hint }: SectionHeadingProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <ThemedText style={[styles.title, { color: colors.text }]}>{title}</ThemedText>
      {hint ? <ThemedText style={[styles.hint, { color: colors.textSecondary }]}>{hint}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
    marginTop: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  hint: {
    fontSize: 13,
    marginTop: 4,
  },
});
