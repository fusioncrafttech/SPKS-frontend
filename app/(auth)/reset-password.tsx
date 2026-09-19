import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TouchableWithoutFeedback } from 'react-native';

import { HeroBanner } from '@/components/ui/hero-banner';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { TextInput } from '@/components/ui/text-input';
import { Brand } from '@/constants/brand';
import { resetPassword } from '@/lib/auth';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!token) {
      Alert.alert('Reset link', 'This reset link is missing a token. Open the link from your email.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, password });
      Alert.alert('Password updated', 'Sign in with your new password.', [
        { text: 'Login', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Could not reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <ScreenScroll keyboardShouldPersistTaps="handled" contentStyle={styles.scroll}>
            <HeroBanner
              showLogo
              eyebrow="SPKS Exam Academy"
              title="Set a new password"
              subtitle="Choose a password you have not used before"
              gradient={Brand.indigo}
            />
            <TextInput label="New password" placeholder="Enter new password" value={password} onChangeText={setPassword} secureTextEntry />
            <TextInput label="Confirm password" placeholder="Re-enter password" value={confirm} onChangeText={setConfirm} secureTextEntry />
            <PrimaryButton title={loading ? 'Saving...' : 'Update password'} onPress={handleReset} disabled={loading} />
          </ScreenScroll>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 12, flexGrow: 1, justifyContent: 'center' },
});
