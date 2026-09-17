import { ApiResultsModal } from '@/components/ui/api-results-modal';
import { HeroBanner } from '@/components/ui/hero-banner';
import { MenuRow, MenuStack } from '@/components/ui/menu-row';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { Brand } from '@/constants/brand';
import { useCatalogResults } from '@/hooks/use-catalog-results';
import { loadCourseItems } from '@/lib/catalog';

const VIDEO_CATEGORIES = [
  { id: 'mathematics', title: 'Mathematics', icon: 'calculator-outline' as const },
  { id: 'reasoning', title: 'Reasoning', icon: 'bulb-outline' as const },
  { id: 'general-awareness', title: 'General Awareness', icon: 'newspaper-outline' as const },
  { id: 'science', title: 'Science', icon: 'flask-outline' as const },
  { id: 'computer', title: 'Basics of Computer', icon: 'desktop-outline' as const },
  { id: 'environment', title: 'Environment & Pollution', icon: 'leaf-outline' as const },
  { id: 'technical', title: 'Technical Subject', icon: 'cog-outline' as const },
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
          title="RRB video explanations"
          subtitle="Subject-wise tutorials connected directly to YouTube"
          gradient={Brand.teal}
        />
        <MenuStack>
          {VIDEO_CATEGORIES.map((item, index) => (
            <MenuRow
              key={item.id}
              title={item.title}
              subtitle="Video tutorials available"
              icon={item.icon}
              index={index}
              onPress={() => results.show(item.title, () => loadCourseItems('rrb', 'videos', { category: item.id, search: item.title }))}
            />
          ))}
        </MenuStack>
      </ScreenScroll>
      <ApiResultsModal visible={results.visible} title={results.title} loading={results.loading} items={results.items} emptyMessage={results.emptyMessage} onClose={results.close} />
    </Screen>
  );
}
