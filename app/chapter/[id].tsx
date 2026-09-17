import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { EmptyNote } from '@/components/ui/empty-note';
import { HeroBanner } from '@/components/ui/hero-banner';
import { MenuRow, MenuStack } from '@/components/ui/menu-row';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { Brand } from '@/constants/brand';
import { useTheme } from '@/contexts/theme-context';
import { CatalogItem, itemSubtitle, itemTitle, openCatalogItem } from '@/lib/catalog';
import { listChapterContent, listChapterLessons, type NamedItem } from '@/lib/study';
import { promptPremium } from '@/lib/tests';

export default function ChapterScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [pdfs, setPdfs] = useState<CatalogItem[]>([]);
  const [lessons, setLessons] = useState<NamedItem[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([listChapterContent(id), listChapterLessons(id)])
      .then(([content, lessonItems]) => {
        setPdfs(content);
        setLessons(lessonItems);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Screen>
      <PageHeader title="Chapter" />
      <ScreenScroll>
        <HeroBanner
          icon="book"
          eyebrow="Chapter"
          title="PDFs and lessons"
          subtitle="Locked items open the Plans tab"
          gradient={Brand.indigoSoft}
        />
        {loading ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator color={colors.tint} />
          </View>
        ) : (
          <>
            <SectionHeading title="PDFs" />
            {pdfs.length ? (
              <MenuStack>
                {pdfs.map((item, index) => (
                  <MenuRow
                    key={item.id}
                    title={itemTitle(item)}
                    subtitle={item.isLocked ? 'Premium' : itemSubtitle(item) || 'Open PDF'}
                    icon={item.isLocked ? 'lock-closed-outline' : 'document-outline'}
                    index={index}
                    locked={item.isLocked}
                    onPress={() => {
                      if (item.isLocked) {
                        promptPremium('This PDF is locked. Upgrade to open it.');
                        return;
                      }
                      void openCatalogItem(item);
                    }}
                  />
                ))}
              </MenuStack>
            ) : (
              <EmptyNote title="No PDFs" message="Upload a file on this chapter in admin, then it will appear here." />
            )}

            <View style={{ height: 18 }} />
            <SectionHeading title="Lessons" />
            {lessons.length ? (
              <MenuStack>
                {lessons.map((item, index) => (
                  <MenuRow
                    key={item.id}
                    title={item.title}
                    subtitle={item.subtitle || 'Open lesson'}
                    icon="play-outline"
                    index={index}
                    locked={item.isLocked}
                    onPress={() => {
                      if (item.isLocked) {
                        promptPremium();
                        return;
                      }
                      router.push(`/lesson/${item.id}` as any);
                    }}
                  />
                ))}
              </MenuStack>
            ) : (
              <EmptyNote title="No lessons" message="Admin can add lessons under this chapter." />
            )}
          </>
        )}
      </ScreenScroll>
    </Screen>
  );
}
