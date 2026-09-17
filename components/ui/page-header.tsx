import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';

type PageHeaderProps = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
};

export function PageHeader({ title, onBack, right }: PageHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack || (() => router.back())}
        style={[styles.backButton, { backgroundColor: colors.card }]}
        activeOpacity={0.8}
      >
        <Ionicons name="chevron-back" size={20} color={colors.text} />
      </TouchableOpacity>
      <ThemedText style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </ThemedText>
      {right ? right : <View style={styles.placeholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginHorizontal: 8,
  },
  placeholder: {
    width: 42,
    height: 42,
  },
});
