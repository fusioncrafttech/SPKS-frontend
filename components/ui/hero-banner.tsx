import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BrandLogo } from '@/components/ui/brand-logo';
import type { IonName } from '@/constants/brand';
import { Brand } from '@/constants/brand';

type HeroBannerProps = {
  icon?: IonName;
  showLogo?: boolean;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  gradient?: [string, string];
  action?: ReactNode;
};

export function HeroBanner({
  icon,
  showLogo,
  eyebrow,
  title,
  subtitle,
  gradient = Brand.indigo,
  action,
}: HeroBannerProps) {
  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View style={styles.glow} />
      {showLogo ? (
        <View style={styles.logoWrap}>
          <BrandLogo width={196} />
        </View>
      ) : icon ? (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={22} color="#FFFFFF" />
        </View>
      ) : null}
      {eyebrow ? <ThemedText style={styles.eyebrow}>{eyebrow}</ThemedText> : null}
      <ThemedText style={styles.title}>{title}</ThemedText>
      {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}
      {action}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
    right: -36,
    top: -46,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoWrap: {
    alignSelf: 'flex-start',
    backgroundColor: '#F8FAFF',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 14,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 19,
  },
});
