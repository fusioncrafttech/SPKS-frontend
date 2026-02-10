import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';

export type CourseCardProps = {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  gradientColors?: [string, string];
  onPress?: () => void;
};

export function CourseCard({ title, subtitle, icon, onPress }: CourseCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
          {icon}
        </View>
        <View style={styles.textContainer}>
          <ThemedText style={[styles.title, { color: colors.text }]}>{title}</ThemedText>
          {subtitle && (
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </ThemedText>
          )}
        </View>
        <ThemedText style={[styles.arrow, { color: colors.textMuted }]}>›</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 80,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 24,
    fontWeight: '300',
  },
});
