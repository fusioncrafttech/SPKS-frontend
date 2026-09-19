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
import { listClassSubjects, type NamedItem } from '@/lib/study';
import { handlePremiumError } from '@/lib/premium';

export default function ClassSubjectsScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<NamedItem[]>([]);

  useEffect(() => {
    if (!classId) return;
    listClassSubjects(classId)
      .then(setSubjects)
      .catch((error) => {
        if (handlePremiumError(error, 'This course is locked. Buy a plan to continue.')) return;
        setSubjects([]);
      })
      .finally(() => setLoading(false));
  }, [classId]);

  return (
    <Screen>
      <PageHeader title="Subjects" />
      <ScreenScroll>
        <HeroBanner
          icon="school"
          eyebrow="School books"
          title="Pick a subject"
          subtitle="Subjects come from GET /api/classes/:classId/subjects"
          gradient={Brand.indigoSoft}
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
            message="Admin needs to add subjects for this class before they show in the app."
          />
        )}
      </ScreenScroll>
    </Screen>
  );
}
