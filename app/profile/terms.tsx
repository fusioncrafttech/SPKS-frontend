import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { router } from 'expo-router';

import { useTheme } from '@/contexts/theme-context';
import { ThemedText } from '@/components/themed-text';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

export default function TermsScreen() {
  const { colors } = useTheme();

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />
      <View style={styles.statusBarSpace} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={[styles.backButton, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.backIcon, { color: colors.text }]}>←</ThemedText>
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Terms & Privacy</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Terms of Service */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Terms of Service</ThemedText>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
              Welcome to our application. By using our services, you agree to be bound by these terms and conditions.
            </ThemedText>
            
            <ThemedText style={[styles.subTitle, { color: colors.text }]}>1. Acceptance of Terms</ThemedText>
            <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
              By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.
            </ThemedText>

            <ThemedText style={[styles.subTitle, { color: colors.text }]}>2. Use License</ThemedText>
            <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
              Permission is granted to temporarily download one copy of the materials on this application for personal, non-commercial transitory viewing only.
            </ThemedText>

            <ThemedText style={[styles.subTitle, { color: colors.text }]}>3. User Account</ThemedText>
            <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
              You are responsible for maintaining the confidentiality of your account and password and for restricting access to your device.
            </ThemedText>

            <ThemedText style={[styles.subTitle, { color: colors.text }]}>4. Subscription</ThemedText>
            <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
              Some parts of the service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis.
            </ThemedText>
          </View>
        </View>

        {/* Privacy Policy */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Privacy Policy</ThemedText>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
              Your privacy is important to us. This privacy policy explains how we collect, use, and protect your personal information.
            </ThemedText>

            <ThemedText style={[styles.subTitle, { color: colors.text }]}>1. Information Collection</ThemedText>
            <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
              We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.
            </ThemedText>

            <ThemedText style={[styles.subTitle, { color: colors.text }]}>2. Use of Information</ThemedText>
            <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
              We use the information we collect to provide, maintain, and improve our services, process transactions, and send you related information.
            </ThemedText>

            <ThemedText style={[styles.subTitle, { color: colors.text }]}>3. Information Sharing</ThemedText>
            <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
              We do not share your personal information with third parties except as described in this privacy policy or with your consent.
            </ThemedText>

            <ThemedText style={[styles.subTitle, { color: colors.text }]}>4. Data Security</ThemedText>
            <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
              We take reasonable measures to help protect personal information from loss, theft, misuse, and unauthorized access.
            </ThemedText>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.contactSection}>
          <ThemedText style={[styles.contactText, { color: colors.textSecondary }]}>
            For any questions about these terms, please contact us at:
          </ThemedText>
          <ThemedText style={[styles.contactEmail, { color: colors.tint }]}>fusioncraft.gmail.com</ThemedText>
        </View>

        {/* Last Updated */}
        <ThemedText style={[styles.lastUpdated, { color: colors.textMuted }]}>Last updated: February 2026</ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarSpace: {
    height: STATUSBAR_HEIGHT,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
  },
  contactSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  contactText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 14,
    fontWeight: '600',
  },
  lastUpdated: {
    fontSize: 12,
    textAlign: 'center',
  },
});
