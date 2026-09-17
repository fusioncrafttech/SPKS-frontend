import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { ApiResultsModal } from '@/components/ui/api-results-modal';
import { EmptyNote } from '@/components/ui/empty-note';
import { HeroBanner } from '@/components/ui/hero-banner';
import { MenuRow, MenuStack } from '@/components/ui/menu-row';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import type { IonName } from '@/constants/brand';
import { useTheme } from '@/contexts/theme-context';
import { useCatalogResults } from '@/hooks/use-catalog-results';
import { getCourse } from '@/lib/catalog';
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
  const { colors } = useTheme();
  const results = useCatalogResults();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<NamedItem[]>([]);
  const [courseId, setCourseId] = useState<string>();

  useEffect(() => {
    Promise.all([getCourse(slug), listCourseGroups(slug)])
      .then(([course, items]) => {
        setCourseId(course?.id);
        setGroups(items);
      })
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, [slug]);

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
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator color={colors.tint} />
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
