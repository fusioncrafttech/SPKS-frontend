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
import { listChapterLessons, type NamedItem } from '@/lib/study';
import { handlePremiumError, promptPremium } from '@/lib/tests';

export default function ChapterScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<NamedItem[]>([]);

  useEffect(() => {
    if (!id) return;
    listChapterLessons(id)
      .then(setLessons)
      .catch((error) => {
        if (handlePremiumError(error, 'This course is locked. Buy a plan to continue.')) return;
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Screen>
      <PageHeader title="Chapter" />
      <ScreenScroll>
        <HeroBanner
          icon="book"
          eyebrow="Chapter"
          title="Lessons"
          subtitle="Locked items open the Plans tab"
          gradient={Brand.indigoSoft}
        />
        {loading ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator color={colors.tint} />
          </View>
        ) : lessons.length ? (
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
                    promptPremium('This lesson is locked. Buy a plan to continue.');
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
      </ScreenScroll>
    </Screen>
  );
}
