import { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Link, router } from 'expo-router';

import { useTheme } from '@/contexts/theme-context';
import { ThemedText } from '@/components/themed-text';
import { TextInput } from '@/components/ui/text-input';

export default function LoginScreen() {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [errors, setErrors] = useState<{ name?: string; mobileNumber?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { name?: string; mobileNumber?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    else if (!/^\d{10}$/.test(mobileNumber.replace(/\D/g, ''))) newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Login successful!', [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]);
    } catch {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
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
              <TextInput label="Name" placeholder="Enter your name" value={name} onChangeText={setName} error={errors.name} autoCapitalize="words" autoCorrect={false} />
              <TextInput label="Mobile Number" placeholder="Enter your mobile number" value={mobileNumber} onChangeText={setMobileNumber} error={errors.mobileNumber} keyboardType="phone-pad" maxLength={10} />
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
  button: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14 },
  linkText: { fontSize: 14, fontWeight: '600' },
});
