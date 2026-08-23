import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { TextInput } from '@/components/ui/text-input';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { forgotPassword } from '@/lib/auth';

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
      await login({ email: email.trim(), password });
      router.replace('/(tabs)');
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView behavior="padding" style={styles.keyboardView} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            bounces={false}
          >
            <View style={styles.header}>
              <ThemedText type="title" style={[styles.title, { color: colors.text }]}>Welcome Back</ThemedText>
              <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to continue</ThemedText>
            </View>

            <View style={[styles.formCard, { backgroundColor: colors.card }]}>
              <TextInput label="Email" placeholder="Enter your email" value={email} onChangeText={setEmail} error={errors.email} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
              <TextInput label="Password" placeholder="Enter your password" value={password} onChangeText={setPassword} error={errors.password} secureTextEntry autoCapitalize="none" autoCorrect={false} />
              <TouchableOpacity onPress={() => { setResetEmail(email); setShowForgot(true); }} style={styles.forgotLink}>
                <ThemedText style={[styles.linkText, { color: colors.tint }]}>Forgot password?</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint }]} onPress={handleLogin} disabled={isLoading} activeOpacity={0.8}>
                <ThemedText style={styles.buttonText}>{isLoading ? 'Signing in...' : 'Login'}</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>Don't have an account? </ThemedText>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <ThemedText style={[styles.linkText, { color: colors.tint }]}>Register</ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <Modal visible={showForgot} transparent animationType="slide" onRequestClose={() => setShowForgot(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Reset password</ThemedText>
            <ThemedText style={[styles.modalHint, { color: colors.textSecondary }]}>Enter the email used to register your account.</ThemedText>
            <TextInput label="Email" placeholder="Enter your email" value={resetEmail} onChangeText={setResetEmail} autoCapitalize="none" keyboardType="email-address" />
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint }]} onPress={handleForgotPassword} disabled={isResetting}>
              <ThemedText style={styles.buttonText}>{isResetting ? 'Sending...' : 'Send reset link'}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowForgot(false)} style={styles.cancelButton}>
              <ThemedText style={[styles.linkText, { color: colors.textSecondary }]}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: 40, paddingBottom: 320 },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { marginBottom: 8 },
  subtitle: { fontSize: 16 },
  formCard: { borderRadius: 16, padding: 24, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  forgotLink: { alignSelf: 'flex-end', marginBottom: 8 },
  button: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14 },
  linkText: { fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  modalHint: { fontSize: 14, marginBottom: 16 },
  cancelButton: { alignItems: 'center', marginTop: 16 },
});
