import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { formatSubscriptionDate, subscriptionEndsAt, verifyPayment } from '@/lib/payments';

function checkoutHtml(params: {
  keyId: string;
  orderId: string;
  amount: string;
  currency: string;
  name: string;
  description: string;
  prefillName: string;
  prefillEmail: string;
  prefillContact: string;
}) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  </head>
  <body style="background:#EEF2FF;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
    <p>Opening secure checkout...</p>
    <script>
      var options = {
        key: ${JSON.stringify(params.keyId)},
        amount: ${Number(params.amount) || 0},
        currency: ${JSON.stringify(params.currency)},
        name: ${JSON.stringify(params.name || 'SPKS Exams')},
        description: ${JSON.stringify(params.description)},
        order_id: ${JSON.stringify(params.orderId)},
        prefill: {
          name: ${JSON.stringify(params.prefillName)},
          email: ${JSON.stringify(params.prefillEmail)},
          contact: ${JSON.stringify(params.prefillContact)}
        },
        theme: { color: "#4338CA" },
        handler: function (response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "success",
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          }));
        },
        modal: {
          ondismiss: function () {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: "dismiss" }));
          }
        }
      };
      var checkout = new Razorpay(options);
      checkout.on("payment.failed", function (response) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "error",
          message: (response.error && response.error.description) || "Payment failed"
        }));
      });
      checkout.open();
    </script>
  </body>
</html>`;
}

export default function CheckoutScreen() {
  const { colors } = useTheme();
  const { refreshUser, applySubscription, user } = useAuth();
  const webRef = useRef<WebView>(null);
  const handled = useRef(false);
  const params = useLocalSearchParams<{
    keyId?: string;
    orderId?: string;
    amount?: string;
    currency?: string;
    name?: string;
    description?: string;
  }>();

  const html = useMemo(
    () =>
      checkoutHtml({
        keyId: String(params.keyId || ''),
        orderId: String(params.orderId || ''),
        amount: String(params.amount || '0'),
        currency: String(params.currency || 'INR'),
        name: String(params.name || 'SPKS Exams'),
        description: String(params.description || params.name || 'SPKS plan'),
        prefillName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.name || '',
        prefillEmail: user?.email || '',
        prefillContact: user?.phone || '',
      }),
    [params.amount, params.currency, params.description, params.keyId, params.name, params.orderId, user?.email, user?.firstName, user?.lastName, user?.name, user?.phone]
  );

  const handleMessage = async (raw: string) => {
    if (handled.current) return;
    try {
      const payload = JSON.parse(raw) as {
        type?: string;
        razorpayOrderId?: string;
        razorpayPaymentId?: string;
        razorpaySignature?: string;
        message?: string;
      };
      if (payload.type === 'dismiss') {
        router.back();
        return;
      }
      if (payload.type === 'error') {
        handled.current = true;
        Alert.alert('Payment failed', payload.message || 'Try again.');
        router.back();
        return;
      }
      if (payload.type === 'success' && payload.razorpayOrderId && payload.razorpayPaymentId && payload.razorpaySignature) {
        handled.current = true;
        const verified = await verifyPayment({
          razorpayOrderId: payload.razorpayOrderId,
          razorpayPaymentId: payload.razorpayPaymentId,
          razorpaySignature: payload.razorpaySignature,
        });
        applySubscription({
          hasActiveSubscription: true,
          subscription: verified.subscription,
        });
        const latest = await refreshUser();
        const endsAt = formatSubscriptionDate(subscriptionEndsAt(latest?.subscription || verified.subscription));
        router.replace('/(tabs)');
        Alert.alert(
          'Payment successful',
          endsAt ? `Courses are unlocked until ${endsAt}.` : 'Courses are unlocked until your plan ends.',
        );
      }
    } catch (error) {
      handled.current = false;
      Alert.alert('Payment', error instanceof Error ? error.message : 'Could not verify payment.');
      router.back();
    }
  };

  return (
    <Screen>
      <PageHeader title="Checkout" />
      <View style={[styles.wrap, { backgroundColor: colors.background }]}>
        {params.keyId && params.orderId ? (
          <WebView
            ref={webRef}
            originWhitelist={['*']}
            source={{ html }}
            onMessage={(event) => handleMessage(event.nativeEvent.data)}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loader}>
                <ActivityIndicator color={colors.tint} />
              </View>
            )}
          />
        ) : (
          <View style={styles.loader}>
            <ActivityIndicator color={colors.tint} />
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
