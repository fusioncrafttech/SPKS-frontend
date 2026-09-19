import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SPKS_LOGO } from '@/constants/brand';
import { useTheme } from '@/contexts/theme-context';

type BrandLogoProps = {
  width?: number;
};

export function BrandLogo({ width = 220 }: BrandLogoProps) {
  return (
    <Image
      source={SPKS_LOGO}
      style={{ width, height: width * 0.48 }}
      resizeMode="contain"
      accessibilityLabel="SPKS Exam Academy"
    />
  );
}

type LoadingStateProps = {
  fill?: boolean;
  message?: string;
  width?: number;
};

export function LoadingState({ fill, message, width }: LoadingStateProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrap, fill && styles.fill, { paddingVertical: fill ? 0 : 28 }]}>
      <BrandLogo width={width ?? (fill ? 220 : 140)} />
      <ActivityIndicator color={colors.tint} style={styles.spinner} />
      {message ? (
        <ThemedText style={[styles.message, { color: colors.textSecondary }]}>{message}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    flex: 1,
  },
  spinner: {
    marginTop: 16,
  },
  message: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
  },
});
