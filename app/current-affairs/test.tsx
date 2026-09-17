import { ApiResultsModal } from '@/components/ui/api-results-modal';
import { HeroBanner } from '@/components/ui/hero-banner';
import { MenuRow, MenuStack } from '@/components/ui/menu-row';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { Brand } from '@/constants/brand';
import { useCatalogResults } from '@/hooks/use-catalog-results';
import { findCourse } from '@/lib/catalog';
import { listTests } from '@/lib/tests';

const EXAM_TESTS = [
  { id: 'tnpsc', title: 'TNPSC', subtitle: 'Date wise tests', icon: 'library-outline' as const },
  { id: 'rrb', title: 'RRB', subtitle: 'Date wise tests', icon: 'bus-outline' as const },
  { id: 'tnusrb', title: 'TNUSRB', subtitle: 'Date wise tests', icon: 'shield-checkmark-outline' as const },
];

export default function TestScreen() {
  const results = useCatalogResults();

  return (
    <Screen>
      <PageHeader title="Test" />
      <ScreenScroll>
        <HeroBanner
          icon="create"
          eyebrow="Practice"
          title="Current affairs tests"
          subtitle="Date-wise tests for TNPSC, RRB and TNUSRB"
          gradient={Brand.orange}
        />
        <MenuStack>
          {EXAM_TESTS.map((item, index) => (
            <MenuRow
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              index={index}
              onPress={() =>
                results.show(`${item.title} tests`, async () => {
                  const course = await findCourse(item.id);
                  return listTests({ courseId: course?.id, search: 'current' });
                })
              }
            />
          ))}
        </MenuStack>
      </ScreenScroll>
      <ApiResultsModal visible={results.visible} title={results.title} loading={results.loading} items={results.items} emptyMessage={results.emptyMessage} onClose={results.close} />
    </Screen>
  );
}
