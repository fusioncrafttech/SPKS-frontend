import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';

import { HeroBanner } from '@/components/ui/hero-banner';
import { PageHeader } from '@/components/ui/page-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { TextInput } from '@/components/ui/text-input';
import { Brand } from '@/constants/brand';
import { createSupportTicket } from '@/lib/study';

export default function SupportTicketScreen() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Support', 'Please enter a subject and message.');
      return;
    }
    setLoading(true);
    try {
      await createSupportTicket({ subject: subject.trim(), message: message.trim() });
      Alert.alert('Ticket sent', 'Our team will reply soon.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('Support', error instanceof Error ? error.message : 'Could not send this ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <PageHeader title="Contact support" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <ScreenScroll keyboardShouldPersistTaps="handled">
            <HeroBanner
              icon="chatbubbles"
              eyebrow="Support"
              title="Tell us what you need"
              subtitle="We usually reply during support hours"
              gradient={Brand.indigo}
            />
            <TextInput label="Subject" placeholder="Payment, test, content..." value={subject} onChangeText={setSubject} />
            <TextInput label="Message" placeholder="Describe the issue" value={message} onChangeText={setMessage} />
            <PrimaryButton title={loading ? 'Sending...' : 'Send ticket'} onPress={handleSend} disabled={loading} />
          </ScreenScroll>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Screen>
  );
}
