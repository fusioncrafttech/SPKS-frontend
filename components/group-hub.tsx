import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { ApiResultsModal } from '@/components/ui/api-results-modal';
import { HeroBanner } from '@/components/ui/hero-banner';
import { MenuRow, MenuStack } from '@/components/ui/menu-row';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { useCatalogResults } from '@/hooks/use-catalog-results';
import { EmptyNote } from '@/components/ui/empty-note';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useAuth } from '@/contexts/auth-context';
import { handlePremiumError } from '@/lib/premium';
import { getGroup, listGroupClasses, listGroupResource, type GroupDetail } from '@/lib/study';
import { listGroupTests } from '@/lib/tests';

type CourseSlug = 'tnpsc' | 'rrb' | 'tnusrb';

type Props = {
  courseSlug: CourseSlug;
  gradient: [string, string];
};

export function GroupHubScreen({ courseSlug, gradient }: Props) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { hasActiveSubscription } = useAuth();
  const results = useCatalogResults();
  const groupId = String(id || '');
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [hasClasses, setHasClasses] = useState(courseSlug === 'tnpsc');
  const [loading, setLoading] = useState(true);
  const [premiumBlocked, setPremiumBlocked] = useState(false);

  useEffect(() => {
    if (!groupId) return;
    if (!hasActiveSubscription) {
      setPremiumBlocked(true);
      setLoading(false);
      return;
    }
    Promise.all([getGroup(groupId), listGroupClasses(groupId)])
      .then(([detail, classes]) => {
        setGroup(detail);
        setHasClasses(classes.length > 0);
      })
      .catch((error) => {
        if (handlePremiumError(error)) {
          setPremiumBlocked(true);
        }
      })
      .finally(() => setLoading(false));
  }, [groupId, hasActiveSubscription]);

  const openResource = (kind: 'notes' | 'books' | 'outside-sources' | 'videos' | 'tests', title: string) => {
    results.show(title, () => (kind === 'tests' ? listGroupTests(groupId) : listGroupResource(groupId, kind)));
  };

  const showSchoolBooks = courseSlug === 'tnpsc' || hasClasses;
  const showSubjects = courseSlug !== 'tnpsc';

  return (
    <Screen>
      <PageHeader title={group?.title || 'Group'} />
      <ScreenScroll>
        <HeroBanner
          icon="library"
          eyebrow={courseSlug.toUpperCase()}
          title={group?.title || 'Group'}
          subtitle={group?.subtitle || 'Choose school books, notes, videos or tests'}
          gradient={gradient}
        />
        {loading ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator color="#4338CA" />
          </View>
        ) : premiumBlocked ? (
          <View style={{ gap: 16 }}>
            <EmptyNote
              title="Plan required"
              message="An active plan is required to open courses. Choose 1 month, 6 months, or 1 year."
            />
            <PrimaryButton title="View plans" onPress={() => router.push('/(tabs)/price')} />
          </View>
        ) : (
          <MenuStack>
            {showSchoolBooks ? (
              <MenuRow
                title="School Books"
                subtitle="Classes published for this group"
                icon="school-outline"
                index={0}
                onPress={() => router.push(`/tnpsc/school-books/${groupId}` as any)}
              />
            ) : null}
            {showSubjects ? (
              <MenuRow
                title="Subjects"
                subtitle="Skip class and open group subjects"
                icon="reader-outline"
                index={1}
                onPress={() => router.push(`/study/subjects/${groupId}` as any)}
              />
            ) : null}
            <MenuRow title="Notes" icon="document-text-outline" index={2} onPress={() => openResource('notes', 'Notes')} />
            <MenuRow title="Books" icon="book-outline" index={3} onPress={() => openResource('books', 'Books')} />
            <MenuRow title="Outside source" icon="globe-outline" index={4} onPress={() => openResource('outside-sources', 'Outside source')} />
            <MenuRow title="Video" icon="play-circle-outline" index={5} onPress={() => openResource('videos', 'Videos')} />
            <MenuRow title="Test" icon="create-outline" index={6} onPress={() => openResource('tests', 'Tests')} />
          </MenuStack>
        )}
      </ScreenScroll>
      <ApiResultsModal
        visible={results.visible}
        title={results.title}
        loading={results.loading}
        items={results.items}
        emptyMessage={results.emptyMessage}
        onClose={results.close}
      />
    </Screen>
  );
}
