import { ApiResultsModal } from '@/components/ui/api-results-modal';
import { HeroBanner } from '@/components/ui/hero-banner';
import { MenuRow, MenuStack } from '@/components/ui/menu-row';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/contexts/auth-context';
import { useCatalogResults } from '@/hooks/use-catalog-results';
import { loadCourseItems } from '@/lib/catalog';
import { sendToPlans } from '@/lib/premium';

const VIDEO_CATEGORIES = [
  { id: 'tamil-grammar', title: 'Tamil - Part A (Grammar)', icon: 'reader-outline' as const },
  { id: 'tamil-literature', title: 'Tamil - Part B (Literature)', icon: 'book-outline' as const },
  { id: 'tamil-scholars', title: 'Tamil - Part C (Scholars & Contribution)', icon: 'school-outline' as const },
  { id: 'gk-part-a', title: 'General Knowledge - Part A', icon: 'newspaper-outline' as const },
  { id: 'gk-part-b', title: 'General Knowledge - Part B', icon: 'earth-outline' as const },
];

export default function VideoScreen() {
  const results = useCatalogResults();
  const { hasActiveSubscription } = useAuth();
  const openVideos = (item: (typeof VIDEO_CATEGORIES)[number]) => {
    if (!hasActiveSubscription) {
      sendToPlans();
      return;
    }
    results.show(item.title, () => loadCourseItems('tnusrb', 'videos', { category: item.id, search: item.title }));
  };

  return (
    <Screen>
      <PageHeader title="Video Explain" />
      <ScreenScroll>
        <HeroBanner
          icon="play-circle"
          eyebrow="YouTube"
          title="TNUSRB video explanations"
          subtitle="Grammar, literature, GK and more"
          gradient={Brand.blue}
        />
        <MenuStack>
          {VIDEO_CATEGORIES.map((item, index) => (
            <MenuRow
              key={item.id}
              title={item.title}
              icon={item.icon}
              index={index}
              onPress={() => openVideos(item)}
            />
          ))}
        </MenuStack>
      </ScreenScroll>
      <ApiResultsModal visible={results.visible} title={results.title} loading={results.loading} items={results.items} emptyMessage={results.emptyMessage} onClose={results.close} />
    </Screen>
  );
}
