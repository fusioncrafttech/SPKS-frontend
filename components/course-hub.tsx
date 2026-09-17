import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { EmptyNote } from '@/components/ui/empty-note';
import { HeroBanner } from '@/components/ui/hero-banner';
import { MenuRow, MenuStack } from '@/components/ui/menu-row';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import type { IonName } from '@/constants/brand';
import { useTheme } from '@/contexts/theme-context';
import { getCourse } from '@/lib/catalog';
import { listCourseGroups, type NamedItem } from '@/lib/study';

type Props = {
  slug: 'tnpsc' | 'rrb' | 'tnusrb';
  title: string;
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  icon: IonName;
  gradient: [string, string];
};

export function CourseHubScreen({ slug, title, eyebrow, heroTitle, heroSubtitle, icon, gradient }: Props) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<NamedItem[]>([]);
  const [courseTitle, setCourseTitle] = useState(heroTitle);

  useEffect(() => {
    getCourse(slug)
      .then((course) => {
        if (course?.name || course?.title) setCourseTitle(String(course.name || course.title));
      })
      .catch(() => undefined);
    listCourseGroups(slug)
      .then(setGroups)
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <Screen>
      <PageHeader title={title} />
      <ScreenScroll>
        <HeroBanner icon={icon} eyebrow={eyebrow} title={courseTitle} subtitle={heroSubtitle} gradient={gradient} />
        {loading ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator color={colors.tint} />
          </View>
        ) : groups.length ? (
          <MenuStack>
            {groups.map((item, index) => (
              <MenuRow
                key={item.id}
                title={item.title}
                subtitle={item.subtitle || 'School books, notes, videos and tests'}
                icon="ribbon-outline"
                index={index}
                onPress={() => router.push(`/${slug}/group/${item.id}` as any)}
              />
            ))}
          </MenuStack>
        ) : (
          <EmptyNote
            title="No groups yet"
            message="Admin needs to publish groups for this course. Until then this list stays empty."
          />
        )}
      </ScreenScroll>
    </Screen>
  );
}
