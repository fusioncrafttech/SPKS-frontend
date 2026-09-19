import { Linking, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { useTheme } from '@/contexts/theme-context';
import { LEGAL_CONTACT_EMAIL, LEGAL_CONTACT_PHONE, PRIVACY_SECTIONS } from '@/lib/legal';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();

  return (
    <Screen>
      <PageHeader title="Privacy Policy" />
      <ScreenScroll>
        {PRIVACY_SECTIONS.map((section) => (
          <AppCard key={section.title} style={styles.card}>
            <SectionHeading title={section.title} />
            <ThemedText style={[styles.body, { color: colors.textSecondary }]}>{section.body}</ThemedText>
          </AppCard>
        ))}
        <ThemedText
          style={[styles.link, { color: colors.tint }]}
          onPress={() => Linking.openURL(`mailto:${LEGAL_CONTACT_EMAIL}`)}
        >
          {LEGAL_CONTACT_EMAIL}
        </ThemedText>
        <ThemedText style={[styles.meta, { color: colors.textMuted }]}>{LEGAL_CONTACT_PHONE}</ThemedText>
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  body: { fontSize: 14, lineHeight: 22 },
  link: { textAlign: 'center', fontSize: 14, fontWeight: '700', marginTop: 8 },
  meta: { textAlign: 'center', fontSize: 13, marginTop: 4, marginBottom: 12 },
});
