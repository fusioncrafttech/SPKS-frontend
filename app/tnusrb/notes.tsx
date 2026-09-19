import { ApiResultsModal } from '@/components/ui/api-results-modal';
import { HeroBanner } from '@/components/ui/hero-banner';
import { MenuRow, MenuStack } from '@/components/ui/menu-row';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/contexts/auth-context';
import { useCatalogResults } from '@/hooks/use-catalog-results';
import { loadCourseItems } from '@/lib/catalog';
import { sendToPlans } from '@/lib/premium';

const TAMIL_PARTS = [
  { id: 'tamil-part-a', title: 'பகுதி-அ (இலக்கணம்)', subtitle: 'Part A (Grammar)', icon: 'reader-outline' as const },
  { id: 'tamil-part-b', title: 'பகுதி-ஆ (இலக்கியம்)', subtitle: 'Part B (Literature)', icon: 'book-outline' as const },
  { id: 'tamil-part-c', title: 'பகுதி-இ (இடருடாழ் அறிஞர்களும் தமிழ்த் தொண்டும்)', subtitle: 'Part C (Scholars and Tamil Contribution)', icon: 'school-outline' as const },
];

const GK_PARTS = [
  { id: 'gk-part-a', title: 'PART-A', subtitle: 'General Knowledge Part A', icon: 'newspaper-outline' as const },
  { id: 'gk-part-b', title: 'PART-B', subtitle: 'General Knowledge Part B', icon: 'earth-outline' as const },
];

export default function NotesScreen() {
  const results = useCatalogResults();
  const { hasActiveSubscription } = useAuth();
  const openPart = (title: string) => {
    if (!hasActiveSubscription) {
      sendToPlans();
      return;
    }
    results.show(title, () => loadCourseItems('tnusrb', 'notes', { search: title }));
  };

  return (
    <Screen>
      <PageHeader title="Notes" />
      <ScreenScroll>
        <HeroBanner
          icon="book"
          eyebrow="TNUSRB"
          title="Study notes"
          subtitle="Complete syllabus coverage for SI and PC exams"
          gradient={Brand.blue}
        />
        <SectionHeading title="1. Tamil" />
        <MenuStack>
          {TAMIL_PARTS.map((item, index) => (
            <MenuRow key={item.id} title={item.title} subtitle={item.subtitle} icon={item.icon} index={index} onPress={() => openPart(item.title)} />
          ))}
        </MenuStack>
        <SectionHeading title="2. General Knowledge" />
        <MenuStack>
          {GK_PARTS.map((item, index) => (
            <MenuRow key={item.id} title={item.title} subtitle={item.subtitle} icon={item.icon} index={index} onPress={() => openPart(item.title)} />
          ))}
        </MenuStack>
      </ScreenScroll>
      <ApiResultsModal visible={results.visible} title={results.title} loading={results.loading} items={results.items} emptyMessage={results.emptyMessage} onClose={results.close} />
    </Screen>
  );
}
