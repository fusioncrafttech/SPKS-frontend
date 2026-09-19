import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { EmptyNote } from '@/components/ui/empty-note';
import { HeroBanner } from '@/components/ui/hero-banner';
import { LoadingState } from '@/components/ui/brand-logo';
import { MenuRow, MenuStack } from '@/components/ui/menu-row';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { Brand } from '@/constants/brand';
import { listGroupSubjects, type NamedItem } from '@/lib/study';
import { handlePremiumError } from '@/lib/premium';

export default function GroupSubjectsScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<NamedItem[]>([]);

  useEffect(() => {
    if (!groupId) return;
    listGroupSubjects(groupId)
      .then(setSubjects)
      .catch((error) => {
        if (handlePremiumError(error, 'This course is locked. Buy a plan to continue.')) return;
        setSubjects([]);
      })
      .finally(() => setLoading(false));
  }, [groupId]);

  return (
    <Screen>
      <PageHeader title="Subjects" />
      <ScreenScroll>
        <HeroBanner
          icon="reader"
          eyebrow="Group"
          title="Subjects"
          subtitle="This course skips class and opens group subjects directly"
          gradient={Brand.teal}
        />
        {loading ? (
          <LoadingState />
        ) : subjects.length ? (
          <MenuStack>
            {subjects.map((item, index) => (
              <MenuRow
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                icon="reader-outline"
                index={index}
                onPress={() => router.push(`/subject/${item.id}` as any)}
              />
            ))}
          </MenuStack>
        ) : (
          <EmptyNote
            title="No subjects published"
            message="Admin needs to add subjects for this group."
          />
        )}
      </ScreenScroll>
    </Screen>
  );
}
