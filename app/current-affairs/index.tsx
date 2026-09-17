import { router } from 'expo-router';

import { HeroBanner } from '@/components/ui/hero-banner';
import { MenuRow, MenuStack } from '@/components/ui/menu-row';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { Brand } from '@/constants/brand';

export default function CurrentAffairsScreen() {
  const menuItems = [
    { id: 'day-wise', title: 'Day wise', subtitle: 'State, India and others — daily updates', icon: 'calendar-outline' as const, route: '/current-affairs/day-wise' },
    { id: 'test', title: 'Test', subtitle: 'TNPSC, RRB and TNUSRB date-wise tests', icon: 'create-outline' as const, route: '/current-affairs/test' },
    { id: 'video', title: 'Video Explain', subtitle: 'Direct connect YouTube', icon: 'play-circle-outline' as const, route: '/current-affairs/video' },
  ];

  return (
    <Screen>
      <PageHeader title="Current Affairs" />
      <ScreenScroll>
        <HeroBanner
          icon="newspaper"
          eyebrow="Daily"
          title="Current Affairs"
          subtitle="State, India and world updates with tests and video explainers"
          gradient={Brand.orange}
        />
        <MenuStack>
          {menuItems.map((item, index) => (
            <MenuRow
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              index={index}
              onPress={() => router.push(item.route as any)}
            />
          ))}
        </MenuStack>
      </ScreenScroll>
    </Screen>
  );
}
