import { ReactNode } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, View, type ScrollViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '@/contexts/theme-context';

export const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

type ScreenProps = {
  children: ReactNode;
};

export function Screen({ children }: ScreenProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />
      <View style={styles.statusBarSpace} />
      {children}
    </View>
  );
}

type ScreenScrollProps = ScrollViewProps & {
  children: ReactNode;
  contentStyle?: ViewStyle;
};

export function ScreenScroll({ children, contentStyle, ...rest }: ScreenScrollProps) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      showsVerticalScrollIndicator={false}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarSpace: {
    height: STATUSBAR_HEIGHT,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
});
