import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { HeroBanner } from '@/components/ui/hero-banner';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { TextInput } from '@/components/ui/text-input';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { forgotPassword } from '@/lib/auth';
import { postAuthHref } from '@/lib/premium';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = 'Please enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const user = await login({ email: email.trim(), password });
      router.replace(postAuthHref(Boolean(user.hasActiveSubscription)));
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    setIsResetting(true);
    try {
      await forgotPassword(resetEmail);
      setShowForgot(false);
      setResetEmail('');
      Alert.alert('Check your email', 'If that email exists, a reset link has been sent.');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Could not send reset email.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Screen>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView behavior="padding" style={styles.keyboardView} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <ScreenScroll keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" bounces={false} contentStyle={styles.scroll}>
            <HeroBanner
              icon="school"
              eyebrow="SPKS"
              title="Welcome back"
              subtitle="Sign in to continue your exam preparation"
              gradient={Brand.indigo}
            />
            <View style={[styles.formCard, { backgroundColor: colors.card }]}>
              <TextInput label="Email" placeholder="Enter your email" value={email} onChangeText={setEmail} error={errors.email} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
              <TextInput label="Password" placeholder="Enter your password" value={password} onChangeText={setPassword} error={errors.password} secureTextEntry autoCapitalize="none" autoCorrect={false} />
              <TouchableOpacity onPress={() => { setResetEmail(email); setShowForgot(true); }} style={styles.forgotLink}>
                <ThemedText style={[styles.linkText, { color: colors.tint }]}>Forgot password?</ThemedText>
              </TouchableOpacity>
              <PrimaryButton title={isLoading ? 'Signing in...' : 'Login'} onPress={handleLogin} disabled={isLoading} />
            </View>
            <View style={styles.footer}>
              <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>Don't have an account? </ThemedText>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <ThemedText style={[styles.linkText, { color: colors.tint }]}>Register</ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          </ScreenScroll>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <Modal visible={showForgot} transparent animationType="slide" onRequestClose={() => setShowForgot(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Reset password</ThemedText>
            <ThemedText style={[styles.modalHint, { color: colors.textSecondary }]}>Enter the email used to register your account.</ThemedText>
            <TextInput label="Email" placeholder="Enter your email" value={resetEmail} onChangeText={setResetEmail} autoCapitalize="none" keyboardType="email-address" />
            <PrimaryButton title={isResetting ? 'Sending...' : 'Send reset link'} onPress={handleForgotPassword} disabled={isResetting} />
            <TouchableOpacity onPress={() => setShowForgot(false)} style={styles.cancelButton}>
              <ThemedText style={[styles.linkText, { color: colors.textSecondary }]}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  scroll: { paddingTop: 12, flexGrow: 1, justifyContent: 'center' },
  formCard: { borderRadius: 22, padding: 20, marginBottom: 20 },
  forgotLink: { alignSelf: 'flex-end', marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14 },
  linkText: { fontSize: 14, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  modalHint: { fontSize: 14, marginBottom: 16 },
  cancelButton: { alignItems: 'center', marginTop: 16 },
});
