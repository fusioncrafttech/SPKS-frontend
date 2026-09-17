import { ApiResultsModal } from '@/components/ui/api-results-modal';
import { HeroBanner } from '@/components/ui/hero-banner';
import { MenuRow, MenuStack } from '@/components/ui/menu-row';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { Brand } from '@/constants/brand';
import { useCatalogResults } from '@/hooks/use-catalog-results';
import { api, asList } from '@/lib/api';
import { CatalogItem } from '@/lib/catalog';

const CATEGORIES = [
  { id: 'state', title: 'மாநிலம்', subtitle: 'State', icon: 'business-outline' as const },
  { id: 'india', title: 'இந்தியா', subtitle: 'India', icon: 'flag-outline' as const },
  { id: 'others', title: 'மற்றவை', subtitle: 'Others', icon: 'earth-outline' as const },
];

export default function DayWiseScreen() {
  const results = useCatalogResults();

  return (
    <Screen>
      <PageHeader title="Day wise" />
      <ScreenScroll>
        <HeroBanner
          icon="calendar"
          eyebrow="Daily"
          title="Current affairs by region"
          subtitle="Daily updates organized by State, India and Others"
          gradient={Brand.orange}
        />
        <MenuStack>
          {CATEGORIES.map((item, index) => (
            <MenuRow
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              index={index}
              onPress={() => results.show(item.title, async () => asList<CatalogItem>(await api.get<CatalogItem[]>('/api/current-affairs', { category: item.id, limit: 50 })))}
            />
          ))}
        </MenuStack>
      </ScreenScroll>
      <ApiResultsModal visible={results.visible} title={results.title} loading={results.loading} items={results.items} emptyMessage={results.emptyMessage} onClose={results.close} />
    </Screen>
  );
}
