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
import { getGroup, listGroupClasses, type NamedItem } from '@/lib/study';

export default function SchoolBooksScreen() {
  const { colors } = useTheme();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('School Books');
  const [classes, setClasses] = useState<NamedItem[]>([]);

  useEffect(() => {
    if (!groupId) return;
    getGroup(groupId).then((group) => {
      if (group?.title) setTitle(group.title);
    });
    listGroupClasses(groupId)
      .then(setClasses)
      .catch(() => setClasses([]))
      .finally(() => setLoading(false));
  }, [groupId]);

  return (
    <Screen>
      <PageHeader title="School Books" />
      <ScreenScroll>
        <HeroBanner
          icon="school"
          eyebrow={title}
          title="Select your class"
          subtitle="Only classes published by admin are listed"
          gradient={Brand.indigoSoft}
        />
        {loading ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator color={colors.tint} />
          </View>
        ) : classes.length ? (
          <MenuStack>
            {classes.map((item, index) => (
              <MenuRow
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                icon="school-outline"
                index={index}
                onPress={() => router.push(`/tnpsc/school-books/${groupId}/class/${item.id}` as any)}
              />
            ))}
          </MenuStack>
        ) : (
          <EmptyNote
            title="No classes published"
            message="Admin needs to add Class 5–12 (or other classes) for this group before they appear here. The app uses API IDs, not hardcoded class numbers."
          />
        )}
      </ScreenScroll>
    </Screen>
  );
}
