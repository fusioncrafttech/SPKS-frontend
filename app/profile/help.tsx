import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Linking,
} from 'react-native';
import { router } from 'expo-router';

import { useTheme } from '@/contexts/theme-context';
import { ThemedText } from '@/components/themed-text';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

const faqs = [
  {
    id: '1',
    question: 'How do I reset my password?',
    answer: 'Go to Profile > Settings > Change Password to reset your password.',
  },
  {
    id: '2',
    question: 'How can I download courses for offline use?',
    answer: 'Tap the download icon on any course to save it for offline viewing.',
  },
  {
    id: '3',
    question: 'How do I track my progress?',
    answer: 'Go to Profile > My Progress to see your learning statistics and course completion.',
  },
  {
    id: '4',
    question: 'Can I change my subscription plan?',
    answer: 'Yes, go to the Price tab to view and change your subscription plan.',
  },
];

export default function HelpScreen() {
  const { colors } = useTheme();

  const handleBack = () => {
    router.back();
  };

  const handleCall = () => {
    Linking.openURL('tel:+919360121830');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:fusioncraft.gmail.com');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/919360121830');
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
        <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Help & Support</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Card */}
        <View style={[styles.contactCard, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.contactTitle, { color: colors.text }]}>Contact Us</ThemedText>
          <ThemedText style={[styles.contactSubtitle, { color: colors.textSecondary }]}>
            We're here to help! Reach out to us anytime.
          </ThemedText>

          <View style={styles.contactMethods}>
            <TouchableOpacity style={[styles.contactMethod, { backgroundColor: colors.inputBg }]} onPress={handleCall}>
              <View style={[styles.contactIcon, { backgroundColor: colors.success }]}>
                <ThemedText style={styles.contactEmoji}>📞</ThemedText>
              </View>
              <View style={styles.contactInfo}>
                <ThemedText style={[styles.contactLabel, { color: colors.textSecondary }]}>Phone</ThemedText>
                <ThemedText style={[styles.contactValue, { color: colors.text }]}>+91 9360121830</ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.contactMethod, { backgroundColor: colors.inputBg }]} onPress={handleEmail}>
              <View style={[styles.contactIcon, { backgroundColor: colors.tint }]}>
                <ThemedText style={styles.contactEmoji}>📧</ThemedText>
              </View>
              <View style={styles.contactInfo}>
                <ThemedText style={[styles.contactLabel, { color: colors.textSecondary }]}>Email</ThemedText>
                <ThemedText style={[styles.contactValue, { color: colors.text }]}>fusioncraft.gmail.com</ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.contactMethod, { backgroundColor: colors.inputBg }]} onPress={handleWhatsApp}>
              <View style={[styles.contactIcon, { backgroundColor: '#25D366' }]}>
                <ThemedText style={styles.contactEmoji}>💬</ThemedText>
              </View>
              <View style={styles.contactInfo}>
                <ThemedText style={[styles.contactLabel, { color: colors.textSecondary }]}>WhatsApp</ThemedText>
                <ThemedText style={[styles.contactValue, { color: colors.text }]}>+91 9360121830</ThemedText>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</ThemedText>
        
        <View style={[styles.faqCard, { backgroundColor: colors.card }]}>
          {faqs.map((faq, index) => (
            <View key={faq.id}>
              <View style={styles.faqItem}>
                <ThemedText style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</ThemedText>
                <ThemedText style={[styles.faqAnswer, { color: colors.textSecondary }]}>{faq.answer}</ThemedText>
              </View>
              {index < faqs.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            </View>
          ))}
        </View>

        {/* Support Hours */}
        <View style={[styles.hoursCard, { backgroundColor: colors.card }]}>
          <ThemedText style={[styles.hoursTitle, { color: colors.text }]}>Support Hours</ThemedText>
          <View style={styles.hoursRow}>
            <ThemedText style={[styles.hoursDay, { color: colors.text }]}>Monday - Friday</ThemedText>
            <ThemedText style={[styles.hoursTime, { color: colors.tint }]}>9:00 AM - 6:00 PM</ThemedText>
          </View>
          <View style={styles.hoursRow}>
            <ThemedText style={[styles.hoursDay, { color: colors.text }]}>Saturday</ThemedText>
            <ThemedText style={[styles.hoursTime, { color: colors.tint }]}>10:00 AM - 4:00 PM</ThemedText>
          </View>
          <View style={styles.hoursRow}>
            <ThemedText style={[styles.hoursDay, { color: colors.text }]}>Sunday</ThemedText>
            <ThemedText style={[styles.hoursTime, { color: colors.tint }]}>Closed</ThemedText>
          </View>
        </View>
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
  contactCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  contactMethods: {
    gap: 12,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contactEmoji: {
    fontSize: 20,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  faqCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqItem: {
    padding: 16,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
  },
  hoursCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  hoursDay: {
    fontSize: 14,
  },
  hoursTime: {
    fontSize: 14,
    fontWeight: '600',
  },
});
