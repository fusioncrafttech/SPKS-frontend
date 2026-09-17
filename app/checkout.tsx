import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';
import { useTheme } from '@/contexts/theme-context';
import { verifyPayment } from '@/lib/payments';

function checkoutHtml(params: {
  keyId: string;
  orderId: string;
  amount: string;
  currency: string;
  name: string;
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
        amount: ${JSON.stringify(params.amount)},
        currency: ${JSON.stringify(params.currency)},
        name: "SPKS",
        description: ${JSON.stringify(params.name)},
        order_id: ${JSON.stringify(params.orderId)},
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
  const webRef = useRef<WebView>(null);
  const params = useLocalSearchParams<{
    keyId?: string;
    orderId?: string;
    amount?: string;
    currency?: string;
    name?: string;
  }>();

  const html = useMemo(
    () =>
      checkoutHtml({
        keyId: String(params.keyId || ''),
        orderId: String(params.orderId || ''),
        amount: String(params.amount || '0'),
        currency: String(params.currency || 'INR'),
        name: String(params.name || 'SPKS plan'),
      }),
    [params.amount, params.currency, params.keyId, params.name, params.orderId]
  );

  const handleMessage = async (raw: string) => {
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
        Alert.alert('Payment failed', payload.message || 'Try again.');
        router.back();
        return;
      }
      if (payload.type === 'success' && payload.razorpayOrderId && payload.razorpayPaymentId && payload.razorpaySignature) {
        await verifyPayment({
          razorpayOrderId: payload.razorpayOrderId,
          razorpayPaymentId: payload.razorpayPaymentId,
          razorpaySignature: payload.razorpaySignature,
        });
        Alert.alert('Payment successful', 'Your plan is now active.', [
          { text: 'OK', onPress: () => router.replace('/(tabs)/price') },
        ]);
      }
    } catch (error) {
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
