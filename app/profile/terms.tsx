import { useEffect, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { useTheme } from '@/contexts/theme-context';
import { api } from '@/lib/api';
import { getRefundPolicy } from '@/lib/study';

export default function TermsScreen() {
  const { colors } = useTheme();
  const [terms, setTerms] = useState({ title: 'Terms of Service', content: '' });
  const [privacy, setPrivacy] = useState({ title: 'Privacy Policy', content: '' });
  const [refund, setRefund] = useState({ title: 'Refund Policy', content: '' });

  useEffect(() => {
    api.get<{ title?: string; content?: string }>('/api/legal/terms')
      .then((data) => {
        if (data?.content) setTerms({ title: data.title || 'Terms of Service', content: data.content });
      })
      .catch(() => undefined);
    api.get<{ title?: string; content?: string }>('/api/legal/privacy-policy')
      .then((data) => {
        if (data?.content) setPrivacy({ title: data.title || 'Privacy Policy', content: data.content });
      })
      .catch(() => undefined);
    getRefundPolicy().then((data) => {
      if (data?.content) setRefund({ title: data.title || 'Refund Policy', content: data.content });
    });
  }, []);

  return (
    <Screen>
      <PageHeader title="Terms & Privacy" />
      <ScreenScroll>
        <SectionHeading title={terms.title} />
        <AppCard style={{ marginBottom: 20 }}>
          {terms.content ? (
            <ThemedText style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22 }}>{terms.content}</ThemedText>
          ) : (
            <>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22 }}>
                Welcome to our application. By using our services, you agree to be bound by these terms and conditions.
              </ThemedText>
              <ThemedText style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 16, marginBottom: 8 }}>1. Acceptance of Terms</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22 }}>
                By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.
              </ThemedText>
              <ThemedText style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 16, marginBottom: 8 }}>2. Use License</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22 }}>
                Permission is granted to temporarily download one copy of the materials on this application for personal, non-commercial transitory viewing only.
              </ThemedText>
              <ThemedText style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 16, marginBottom: 8 }}>3. User Account</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22 }}>
                You are responsible for maintaining the confidentiality of your account and password and for restricting access to your device.
              </ThemedText>
              <ThemedText style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 16, marginBottom: 8 }}>4. Subscription</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22 }}>
                Some parts of the service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis.
              </ThemedText>
            </>
          )}
        </AppCard>

        <SectionHeading title={privacy.title} />
        <AppCard style={{ marginBottom: 20 }}>
          {privacy.content ? (
            <ThemedText style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22 }}>{privacy.content}</ThemedText>
          ) : (
            <>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22 }}>
                Your privacy is important to us. This privacy policy explains how we collect, use, and protect your personal information.
              </ThemedText>
              <ThemedText style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 16, marginBottom: 8 }}>1. Information Collection</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22 }}>
                We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.
              </ThemedText>
              <ThemedText style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 16, marginBottom: 8 }}>2. Use of Information</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22 }}>
                We use the information we collect to provide, maintain, and improve our services, process transactions, and send you related information.
              </ThemedText>
              <ThemedText style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 16, marginBottom: 8 }}>3. Information Sharing</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22 }}>
                We do not share your personal information with third parties except as described in this privacy policy or with your consent.
              </ThemedText>
              <ThemedText style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 16, marginBottom: 8 }}>4. Data Security</ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22 }}>
                We take reasonable measures to help protect personal information from loss, theft, misuse, and unauthorized access.
              </ThemedText>
            </>
          )}
        </AppCard>
        <SectionHeading title={refund.title} />
        <AppCard style={{ marginBottom: 20 }}>
          <ThemedText style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22 }}>
            {refund.content || 'Paid plans can be cancelled from the Plans tab. Refunds follow the policy published by SPKS and the payment provider.'}
          </ThemedText>
        </AppCard>
        <ThemedText style={{ textAlign: 'center', color: colors.textSecondary, fontSize: 14, marginBottom: 6 }}>
          For questions, contact fusioncraft.gmail.com
        </ThemedText>
        <ThemedText style={{ textAlign: 'center', color: colors.textMuted, fontSize: 12 }}>Last updated: February 2026</ThemedText>
      </ScreenScroll>
    </Screen>
  );
}
