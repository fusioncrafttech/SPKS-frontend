import { ApiResultsModal } from '@/components/ui/api-results-modal';
import { HeroBanner } from '@/components/ui/hero-banner';
import { MenuRow, MenuStack } from '@/components/ui/menu-row';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { Brand } from '@/constants/brand';
import { useCatalogResults } from '@/hooks/use-catalog-results';
import { api, asList } from '@/lib/api';
import { CatalogItem } from '@/lib/catalog';

const VIDEO_CATEGORIES = [
  { id: 'state-updates', title: 'State Current Affairs', icon: 'business-outline' as const },
  { id: 'india-updates', title: 'India Current Affairs', icon: 'flag-outline' as const },
  { id: 'international', title: 'International Affairs', icon: 'earth-outline' as const },
  { id: 'daily-analysis', title: 'Daily Analysis', icon: 'analytics-outline' as const },
  { id: 'monthly-digest', title: 'Monthly Digest', icon: 'calendar-outline' as const },
];

export default function VideoScreen() {
  const results = useCatalogResults();

  return (
    <Screen>
      <PageHeader title="Video Explain" />
      <ScreenScroll>
        <HeroBanner
          icon="play-circle"
          eyebrow="YouTube"
          title="Current affairs videos"
          subtitle="Daily analysis and monthly digest explainers"
          gradient={Brand.orange}
        />
        <MenuStack>
          {VIDEO_CATEGORIES.map((item, index) => (
            <MenuRow
              key={item.id}
              title={item.title}
              icon={item.icon}
              index={index}
              onPress={() => results.show(item.title, async () => asList<CatalogItem>(await api.get<CatalogItem[]>('/api/videos', { category: item.id, limit: 50 })))}
            />
          ))}
        </MenuStack>
      </ScreenScroll>
      <ApiResultsModal visible={results.visible} title={results.title} loading={results.loading} items={results.items} emptyMessage={results.emptyMessage} onClose={results.close} />
    </Screen>
  );
}
