import Ionicons from '@expo/vector-icons/Ionicons';
import { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { IonName } from '@/constants/brand';
import { iconTint } from '@/constants/brand';
import { useTheme } from '@/contexts/theme-context';

type MenuRowProps = {
  title: string;
  subtitle?: string;
  icon?: IonName;
  index?: number;
  locked?: boolean;
  onPress?: () => void;
};

export function MenuRow({ title, subtitle, icon = 'chevron-forward', index = 0, locked, onPress }: MenuRowProps) {
  const { colors, isDark } = useTheme();
  const tint = iconTint(index);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={[styles.iconWrap, { backgroundColor: isDark ? tint.darkBg : tint.bg }]}>
        <Ionicons name={icon} size={20} color={isDark ? '#E2E8F0' : tint.color} />
      </View>
      <View style={styles.copy}>
        <ThemedText style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {locked ? <Ionicons name="lock-closed" size={16} color={colors.textMuted} /> : <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
    </TouchableOpacity>
  );
}

export function MenuStack({ children }: { children: ReactNode }) {
  return <View style={styles.stack}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  stack: {
    gap: 12,
  },
});
