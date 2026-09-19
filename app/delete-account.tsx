import { useState } from 'react';
import { Alert, Linking, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { PageHeader } from '@/components/ui/page-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { TextInput } from '@/components/ui/text-input';
import { useTheme } from '@/contexts/theme-context';
import { ACCOUNT_DELETION_DAYS, LEGAL_CONTACT_EMAIL } from '@/lib/legal';

export default function DeleteAccountScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');

  const handleRequest = async () => {
    if (!email.trim() || !name.trim()) {
      Alert.alert('Delete account', 'Please enter your registered email and full name.');
      return;
    }
    const subject = encodeURIComponent('Delete SPKS Exam Academy account');
    const body = encodeURIComponent(
      `Please delete my SPKS Exam Academy account.\n\nName: ${name.trim()}\nRegistered email: ${email.trim()}\nReason: ${reason.trim() || 'Not specified'}`,
    );
    await Linking.openURL(`mailto:${LEGAL_CONTACT_EMAIL}?subject=${subject}&body=${body}`);
  };

  return (
    <Screen>
      <PageHeader title="Delete account" />
      <ScreenScroll>
        <AppCard style={styles.card}>
          <ThemedText style={[styles.body, { color: colors.textSecondary }]}>
            You can delete your account from Profile → Settings in the app, or send a request from this page. We complete deletion within {ACCOUNT_DELETION_DAYS} days.
          </ThemedText>
        </AppCard>
        <AppCard style={styles.card}>
          <ThemedText style={[styles.heading, { color: colors.text }]}>What is deleted</ThemedText>
          <ThemedText style={[styles.body, { color: colors.textSecondary }]}>
            Profile details, login credentials, test history, progress, bookmarks, support tickets and device tokens are removed. Payment invoices may be kept where the law requires it.
          </ThemedText>
        </AppCard>
        <TextInput label="Registered email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput label="Full name" placeholder="Your name" value={name} onChangeText={setName} autoCapitalize="words" />
        <TextInput label="Reason (optional)" placeholder="Why you want to delete the account" value={reason} onChangeText={setReason} />
        <PrimaryButton title="Request account deletion" onPress={handleRequest} />
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  heading: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 22 },
});
