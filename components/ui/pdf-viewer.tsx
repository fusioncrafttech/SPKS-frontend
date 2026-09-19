import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';
import { API_URL, apiFetch, ApiError, getAccessToken, toAbsoluteApiUrl } from '@/lib/api';
import { isPremiumRequired, promptPremium } from '@/lib/tests';

type Props = {
  uri: string;
};

function pdfSourceUri(uri: string) {
  if (!uri) return '';
  return uri.startsWith('http') ? uri : toAbsoluteApiUrl(uri) || `${API_URL}${uri.startsWith('/') ? uri : `/${uri}`}`;
}

function uint8ToBase64(bytes: Uint8Array) {
  let binary = '';
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function pdfHtml(base64: string) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=3" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
    <style>
      html, body { margin: 0; padding: 0; background: #525659; }
      #viewer { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 8px 0; }
      canvas { width: 100%; height: auto; background: #fff; }
      .status { color: #fff; font-family: sans-serif; padding: 24px; text-align: center; }
    </style>
  </head>
  <body>
    <div id="status" class="status">Opening PDF…</div>
    <div id="viewer"></div>
    <script>
      pdfjsLib.disableWorker = true;
      const status = document.getElementById('status');
      const viewer = document.getElementById('viewer');
      const data = atob(${JSON.stringify(base64)});
      const bytes = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i += 1) bytes[i] = data.charCodeAt(i);
      pdfjsLib.getDocument({ data: bytes }).promise.then(async (pdf) => {
        status.remove();
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const unscaled = page.getViewport({ scale: 1 });
          const scale = (window.innerWidth - 8) / unscaled.width;
          const viewport = page.getViewport({ scale: scale * (window.devicePixelRatio || 1) });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          viewer.appendChild(canvas);
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        }
      }).catch(() => {
        status.textContent = 'Could not display this PDF.';
      });
    </script>
  </body>
</html>`;
}

export function PdfViewer({ uri }: Props) {
  const { colors } = useTheme();
  const sourceUri = pdfSourceUri(uri);
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [html, setHtml] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const useStreamViewer = Platform.OS !== 'android';

  const source = useMemo(
    () => ({
      uri: sourceUri,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
    [sourceUri, token],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      setHtml('');
      try {
        const accessToken = await getAccessToken();
        if (cancelled) return;
        setToken(accessToken);

        if (useStreamViewer) {
          setLoading(false);
          return;
        }

        const response = await apiFetch(sourceUri);
        if (response.status === 403) {
          promptPremium('This file is locked. Upgrade your plan to view it.');
          throw new ApiError('Premium required', 403, undefined, 'PREMIUM_REQUIRED');
        }
        if (!response.ok) {
          throw new Error('Could not open this PDF.');
        }
        const bytes = new Uint8Array(await response.arrayBuffer());
        if (!cancelled) setHtml(pdfHtml(uint8ToBase64(bytes)));
      } catch (caught) {
        if (cancelled || isPremiumRequired(caught)) return;
        setError(caught instanceof Error ? caught.message : 'Could not open this PDF.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sourceUri, useStreamViewer]);

  if (loading || token === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <ThemedText style={{ color: colors.textSecondary, textAlign: 'center' }}>{error}</ThemedText>
      </View>
    );
  }

  if (useStreamViewer) {
    return <WebView source={source} style={styles.web} originWhitelist={['*']} />;
  }

  if (!html) {
    return (
      <View style={styles.center}>
        <ThemedText style={{ color: colors.textSecondary }}>No PDF is available yet.</ThemedText>
      </View>
    );
  }

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      style={styles.web}
      javaScriptEnabled
      mixedContentMode="always"
      setSupportMultipleWindows={false}
    />
  );
}

const styles = StyleSheet.create({
  web: { flex: 1, backgroundColor: '#525659' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
