import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
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

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  password?: string;
  confirmPassword?: string;
}

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = 'Please enter a valid email address';
    if (mobileNumber.trim() && !/^\d{10}$/.test(mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }
    if (!password) newErrors.password = 'Password is required';
    else if (!PASSWORD_RULE.test(password)) newErrors.password = 'Use 6+ characters with upper, lower, and a number';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: mobileNumber.replace(/\D/g, '') || undefined,
        password,
      });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView behavior="padding" style={styles.keyboardView} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag" bounces={false}>
            <View style={styles.header}>
              <ThemedText type="title" style={[styles.title, { color: colors.text }]}>Create Account</ThemedText>
              <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>Sign up to get started</ThemedText>
            </View>

            <View style={[styles.formCard, { backgroundColor: colors.card }]}>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <TextInput label="First Name" placeholder="First name" value={firstName} onChangeText={setFirstName} error={errors.firstName} autoCapitalize="words" autoCorrect={false} />
                </View>
                <View style={styles.halfInput}>
                  <TextInput label="Last Name" placeholder="Last name" value={lastName} onChangeText={setLastName} error={errors.lastName} autoCapitalize="words" autoCorrect={false} />
                </View>
              </View>
              <TextInput label="Email" placeholder="Enter your email" value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
              <TextInput label="Mobile Number" placeholder="Enter your mobile number" value={mobileNumber} onChangeText={setMobileNumber} error={errors.mobileNumber} keyboardType="phone-pad" maxLength={10} />
              <TextInput label="Password" placeholder="Enter your password" value={password} onChangeText={setPassword} error={errors.password} secureTextEntry autoCapitalize="none" autoCorrect={false} />
              <TextInput label="Confirm Password" placeholder="Confirm your password" value={confirmPassword} onChangeText={setConfirmPassword} error={errors.confirmPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} />
              <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint }]} onPress={handleRegister} disabled={isLoading} activeOpacity={0.8}>
                <ThemedText style={styles.buttonText}>{isLoading ? 'Creating Account...' : 'Register'}</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account? </ThemedText>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <ThemedText style={[styles.linkText, { color: colors.tint }]}>Login</ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  button: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14 },
  linkText: { fontSize: 14, fontWeight: '600' },
});
