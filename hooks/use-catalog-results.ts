import { useCallback, useState } from 'react';

import { CatalogItem } from '@/lib/catalog';
import { handlePremiumError } from '@/lib/premium';

export function useCatalogResults() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [emptyMessage, setEmptyMessage] = useState('No content has been published yet.');

  const close = useCallback(() => setVisible(false), []);

  const show = useCallback(async (label: string, loader: () => Promise<CatalogItem[]>) => {
    setTitle(label);
    setVisible(true);
    setLoading(true);
    setItems([]);
    setEmptyMessage('No content has been published yet.');
    try {
      setItems(await loader());
    } catch (error) {
      if (handlePremiumError(error, 'This content is locked. Buy a plan to continue.')) {
        setVisible(false);
        return;
      }
      setEmptyMessage(error instanceof Error ? error.message : 'Could not load content.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { visible, loading, title, items, emptyMessage, close, show };
}
