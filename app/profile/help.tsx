import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { HeroBanner } from '@/components/ui/hero-banner';
import { PageHeader } from '@/components/ui/page-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { Brand } from '@/constants/brand';
import { useTheme } from '@/contexts/theme-context';
import { api, asList } from '@/lib/api';
import { getHelpContact } from '@/lib/study';

const faqs = [
  { id: '1', question: 'How do I reset my password?', answer: 'Go to Profile > Settings > Change Password, or use Forgot password on login.' },
  { id: '2', question: 'How do I open lesson PDFs?', answer: 'Open a lesson or study material and the PDF opens in the app. Files are viewed in place, not saved to Downloads.' },
  { id: '3', question: 'How do I track my progress?', answer: 'Go to Profile > Progress to see course completion and test history.' },
  { id: '4', question: 'Can I change my subscription plan?', answer: 'Yes, go to the Plans tab to view and change your subscription plan.' },
];

export default function HelpScreen() {
  const { colors } = useTheme();
  const [faqItems, setFaqItems] = useState(faqs);
  const [contact, setContact] = useState({
    phone: '+91 9360121830',
    email: 'fusioncraft@gmail.com',
    whatsapp: '+91 9360121830',
    hours: 'Monday - Friday, 9:00 AM - 6:00 PM',
    address: '',
  });

  useEffect(() => {
    api.get<{ id?: string; question?: string; answer?: string }[]>('/api/help/faqs')
      .then((items) => {
        const list = asList(items);
        if (!list.length) return;
        setFaqItems(list.map((item, index) => ({
          id: String(item.id || index),
          question: item.question || 'Question',
          answer: item.answer || '',
        })));
      })
      .catch(() => undefined);

    getHelpContact().then((data) => {
      if (!data) return;
      setContact((current) => ({
        phone: data.phone || current.phone,
        email: data.email || current.email,
        whatsapp: data.whatsapp || data.phone || current.whatsapp,
        hours: data.hours || current.hours,
        address: data.address || '',
      }));
    });
  }, []);

  const phoneHref = contact.phone.replace(/\s/g, '');
  const whatsappHref = contact.whatsapp.replace(/[^\d]/g, '');
  const contacts = [
    { id: 'phone', label: 'Phone', value: contact.phone, icon: 'call-outline' as const, color: '#059669', onPress: () => Linking.openURL(`tel:${phoneHref}`) },
    { id: 'email', label: 'Email', value: contact.email, icon: 'mail-outline' as const, color: '#4338CA', onPress: () => Linking.openURL(`mailto:${contact.email}`) },
    { id: 'whatsapp', label: 'WhatsApp', value: contact.whatsapp, icon: 'logo-whatsapp' as const, color: '#25D366', onPress: () => Linking.openURL(`https://wa.me/${whatsappHref}`) },
  ];

  return (
    <Screen>
      <PageHeader title="Help & Support" />
      <ScreenScroll>
        <HeroBanner
          icon="help-circle"
          eyebrow="Support"
          title="We're here to help"
          subtitle="Reach out anytime or browse the FAQs below"
          gradient={Brand.indigo}
        />
        <AppCard style={{ marginBottom: 18 }}>
          {contacts.map((item) => (
            <TouchableOpacity key={item.id} style={[styles.contactRow, { backgroundColor: colors.inputBg }]} onPress={item.onPress}>
              <View style={[styles.contactIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.contactLabel, { color: colors.textSecondary }]}>{item.label}</ThemedText>
                <ThemedText style={[styles.contactValue, { color: colors.text }]}>{item.value}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </AppCard>

        <PrimaryButton title="Send a support ticket" onPress={() => router.push('/profile/support' as any)} />
        <View style={{ height: 18 }} />

        <SectionHeading title="Frequently asked questions" />
        <AppCard style={{ marginBottom: 18 }}>
          {faqItems.map((faq, index) => (
            <View key={faq.id} style={[styles.faqItem, index < faqItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <ThemedText style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</ThemedText>
              <ThemedText style={[styles.faqAnswer, { color: colors.textSecondary }]}>{faq.answer}</ThemedText>
            </View>
          ))}
        </AppCard>

        <AppCard>
          <ThemedText style={[styles.hoursTitle, { color: colors.text }]}>Support hours</ThemedText>
          <ThemedText style={{ color: colors.textSecondary, lineHeight: 22 }}>{contact.hours}</ThemedText>
          {contact.address ? (
            <ThemedText style={{ color: colors.textSecondary, marginTop: 8 }}>{contact.address}</ThemedText>
          ) : null}
        </AppCard>
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: { fontSize: 12, marginBottom: 2 },
  contactValue: { fontSize: 15, fontWeight: '700' },
  faqItem: { paddingVertical: 12 },
  faqQuestion: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  faqAnswer: { fontSize: 14, lineHeight: 20 },
  hoursTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
});
