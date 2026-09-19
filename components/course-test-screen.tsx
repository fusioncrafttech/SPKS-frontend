import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { ApiResultsModal } from '@/components/ui/api-results-modal';
import { EmptyNote } from '@/components/ui/empty-note';
import { HeroBanner } from '@/components/ui/hero-banner';
import { LoadingState } from '@/components/ui/brand-logo';
import { MenuRow, MenuStack } from '@/components/ui/menu-row';
import { PageHeader } from '@/components/ui/page-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import type { IonName } from '@/constants/brand';
import { useAuth } from '@/contexts/auth-context';
import { useCatalogResults } from '@/hooks/use-catalog-results';
import { getCourse } from '@/lib/catalog';
import { handlePremiumError } from '@/lib/premium';
import { listCourseGroups, type NamedItem } from '@/lib/study';
import { listGroupTests, listTests } from '@/lib/tests';

type Props = {
  slug: 'tnpsc' | 'rrb' | 'tnusrb';
  title?: string;
  subtitle: string;
  icon: IonName;
  gradient: [string, string];
};

export function CourseTestScreen({ slug, title = 'Test', subtitle, icon, gradient }: Props) {
  const { hasActiveSubscription } = useAuth();
  const results = useCatalogResults();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<NamedItem[]>([]);
  const [courseId, setCourseId] = useState<string>();
  const [premiumBlocked, setPremiumBlocked] = useState(false);

  useEffect(() => {
    if (!hasActiveSubscription) {
      setPremiumBlocked(true);
      setLoading(false);
      return;
    }
    Promise.all([getCourse(slug), listCourseGroups(slug)])
      .then(([course, items]) => {
        setCourseId(course?.id);
        setGroups(items);
      })
      .catch((error) => {
        if (handlePremiumError(error)) {
          setPremiumBlocked(true);
          return;
        }
        setGroups([]);
      })
      .finally(() => setLoading(false));
  }, [slug, hasActiveSubscription]);

  const openGroupTests = (group: NamedItem) => {
    results.show(group.title, async () => {
      const groupTests = await listGroupTests(group.id);
      if (groupTests.length) return groupTests;
      const byGroup = await listTests({ courseId, groupId: group.id });
      if (byGroup.length) return byGroup;
      return listTests({ courseId, search: group.title });
    });
  };

  return (
    <Screen>
      <PageHeader title={title} />
      <ScreenScroll>
        <HeroBanner
          icon={icon}
          eyebrow="Practice"
          title="Select a group"
          subtitle={subtitle}
          gradient={gradient}
        />
        {loading ? (
          <LoadingState />
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
                subtitle={item.subtitle || 'Open published tests'}
                icon={item.title.toLowerCase().includes('other') ? 'apps-outline' : 'ribbon-outline'}
                index={index}
                onPress={() => openGroupTests(item)}
              />
            ))}
          </MenuStack>
        ) : (
          <EmptyNote
            title="No groups yet"
            message="Admin needs to publish groups for this course before tests can appear."
          />
        )}
      </ScreenScroll>
      <ApiResultsModal
        visible={results.visible}
        title={results.title}
        loading={results.loading}
        items={results.items}
        emptyMessage="No tests published for this group yet."
        onClose={results.close}
      />
    </Screen>
  );
}
