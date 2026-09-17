import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { EmptyNote } from '@/components/ui/empty-note';
import { HeroBanner } from '@/components/ui/hero-banner';
import { MenuRow, MenuStack } from '@/components/ui/menu-row';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { Brand } from '@/constants/brand';
import { useTheme } from '@/contexts/theme-context';
import { listSubjectChapters, type NamedItem } from '@/lib/study';

export default function SubjectScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<NamedItem[]>([]);

  useEffect(() => {
    if (!id) return;
    listSubjectChapters(id)
      .then(setChapters)
      .catch(() => setChapters([]))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Screen>
      <PageHeader title="Chapters" />
      <ScreenScroll>
        <HeroBanner
          icon="library"
          eyebrow="School books"
          title="Chapters"
          subtitle="Open a chapter for PDFs and lessons"
          gradient={Brand.indigoSoft}
        />
        {loading ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator color={colors.tint} />
          </View>
        ) : chapters.length ? (
          <MenuStack>
            {chapters.map((item, index) => (
              <MenuRow
                key={item.id}
                title={item.title}
                subtitle={item.subtitle || 'PDFs and lessons'}
                icon="document-text-outline"
                index={index}
                locked={item.isLocked}
                onPress={() => router.push(`/chapter/${item.id}` as any)}
              />
            ))}
          </MenuStack>
        ) : (
          <EmptyNote
            title="No chapters published"
            message="Admin needs to add chapters and upload files for this subject."
          />
        )}
      </ScreenScroll>
    </Screen>
  );
}
