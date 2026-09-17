import { ApiResultsModal } from '@/components/ui/api-results-modal';
import { HeroBanner } from '@/components/ui/hero-banner';
import { MenuRow, MenuStack } from '@/components/ui/menu-row';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { Brand } from '@/constants/brand';
import { useCatalogResults } from '@/hooks/use-catalog-results';
import { loadCourseItems } from '@/lib/catalog';

const UNITS = [
  { id: '1', title: 'Unit – I : General Science', icon: 'flask-outline' as const },
  { id: '2', title: 'Unit – II : Current Events', icon: 'newspaper-outline' as const },
  { id: '3', title: 'Unit – III : Geography', icon: 'earth-outline' as const },
  { id: '4', title: 'Unit – IV : History & Culture', icon: 'business-outline' as const },
  { id: '5', title: 'Unit – V : Indian Polity', icon: 'scale-outline' as const },
  { id: '6', title: 'Unit – VI : Indian Economy', icon: 'stats-chart-outline' as const },
  { id: '7', title: 'Unit – VII : Indian National Movement', icon: 'flag-outline' as const },
  { id: '8', title: 'Unit – VIII : Aptitude & Mental Ability', icon: 'bulb-outline' as const },
];

export default function OutsideSourceScreen() {
  const results = useCatalogResults();

  return (
    <Screen>
      <PageHeader title="Outside Source" />
      <ScreenScroll>
        <HeroBanner
          icon="globe"
          eyebrow="Extra material"
          title="Units"
          subtitle="Select a unit to study additional sources"
          gradient={Brand.indigoSoft}
        />
        <MenuStack>
          {UNITS.map((item, index) => (
            <MenuRow
              key={item.id}
              title={item.title}
              icon={item.icon}
              index={index}
              onPress={() => results.show(item.title, () => loadCourseItems('tnpsc', 'outside-sources', { search: item.title }))}
            />
          ))}
        </MenuStack>
      </ScreenScroll>
      <ApiResultsModal visible={results.visible} title={results.title} loading={results.loading} items={results.items} emptyMessage={results.emptyMessage} onClose={results.close} />
    </Screen>
  );
}
