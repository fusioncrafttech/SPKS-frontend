import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { EmptyNote } from '@/components/ui/empty-note';
import { HeroBanner } from '@/components/ui/hero-banner';
import { MenuRow, MenuStack } from '@/components/ui/menu-row';
import { PageHeader } from '@/components/ui/page-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import type { IonName } from '@/constants/brand';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { getCourse } from '@/lib/catalog';
import { handlePremiumError, promptPremium } from '@/lib/premium';
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
  const { hasActiveSubscription } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<NamedItem[]>([]);
  const [courseTitle, setCourseTitle] = useState(heroTitle);
  const [premiumBlocked, setPremiumBlocked] = useState(false);

  useEffect(() => {
    if (!hasActiveSubscription) {
      setPremiumBlocked(true);
      setLoading(false);
      return;
    }
    getCourse(slug)
      .then((course) => {
        if (course?.name || course?.title) setCourseTitle(String(course.name || course.title));
      })
      .catch((error) => {
        if (handlePremiumError(error)) {
          setPremiumBlocked(true);
        }
      });
    listCourseGroups(slug)
      .then(setGroups)
      .catch((error) => {
        if (handlePremiumError(error)) {
          setPremiumBlocked(true);
          return;
        }
        setGroups([]);
      })
      .finally(() => setLoading(false));
  }, [slug, hasActiveSubscription]);

  return (
    <Screen>
      <PageHeader title={title} />
      <ScreenScroll>
        <HeroBanner icon={icon} eyebrow={eyebrow} title={courseTitle} subtitle={heroSubtitle} gradient={gradient} />
        {loading ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator color={colors.tint} />
          </View>
        ) : premiumBlocked ? (
          <View style={{ gap: 16 }}>
            <EmptyNote
              title="Plan required"
              message="An active plan is required to open courses. Choose 1 month, 6 months, or 1 year."
            />
            <PrimaryButton title="View plans" onPress={() => router.push('/(tabs)/price')} />
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
                locked={item.isLocked}
                onPress={() => {
                  if (item.isLocked) {
                    promptPremium('This course is locked. Buy a plan to continue.');
                    return;
                  }
                  router.push(`/${slug}/group/${item.id}` as any);
                }}
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
