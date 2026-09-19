import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedText } from '@/components/themed-text';
import { LoadingState } from '@/components/ui/brand-logo';
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
      .page-slot { width: 100%; min-height: 70vh; }
      canvas { width: 100%; height: auto; background: #fff; display: block; }
      .status { color: #fff; font-family: sans-serif; padding: 24px; text-align: center; }
    </style>
  </head>
  <body>
    <div id="status" class="status">Opening PDF…</div>
    <div id="viewer"></div>
    <script>
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
      const status = document.getElementById('status');
      const viewer = document.getElementById('viewer');
      const data = atob(${JSON.stringify(base64)});
      const bytes = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i += 1) bytes[i] = data.charCodeAt(i);
      pdfjsLib.getDocument({ data: bytes }).promise.then((pdf) => {
        status.remove();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rendered = new Set();
        async function renderPage(pageNumber) {
          if (rendered.has(pageNumber)) return;
          rendered.add(pageNumber);
          const slot = document.getElementById('page-' + pageNumber);
          if (!slot) return;
          const page = await pdf.getPage(pageNumber);
          const unscaled = page.getViewport({ scale: 1 });
          const scale = (window.innerWidth - 8) / unscaled.width;
          const viewport = page.getViewport({ scale: scale * dpr });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          slot.innerHTML = '';
          slot.style.minHeight = '0';
          slot.appendChild(canvas);
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        }
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const pageNumber = Number(entry.target.getAttribute('data-page'));
            renderPage(pageNumber);
          });
        }, { rootMargin: '600px 0px' });
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const slot = document.createElement('div');
          slot.className = 'page-slot';
          slot.id = 'page-' + pageNumber;
          slot.setAttribute('data-page', String(pageNumber));
          viewer.appendChild(slot);
          observer.observe(slot);
        }
        renderPage(1);
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
    const controller = new AbortController();

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

        const response = await apiFetch(sourceUri, { signal: controller.signal });
        if (cancelled) return;
        if (response.status === 403) {
          promptPremium('This file is locked. Buy a plan to view it.');
          throw new ApiError('Premium required', 403, undefined, 'PREMIUM_REQUIRED');
        }
        if (!response.ok) {
          throw new Error('Could not open this PDF.');
        }
        const bytes = new Uint8Array(await response.arrayBuffer());
        if (!cancelled) setHtml(pdfHtml(uint8ToBase64(bytes)));
      } catch (caught) {
        if (cancelled || isPremiumRequired(caught) || (caught instanceof Error && caught.name === 'AbortError')) return;
        setError(caught instanceof Error ? caught.message : 'Could not open this PDF.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [sourceUri, useStreamViewer]);

  if (loading || token === undefined) {
    return <LoadingState fill />;
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
