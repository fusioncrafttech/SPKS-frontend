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

const NOTES_SUBJECTS = [
  { id: 'mathematics', title: 'Mathematics', icon: 'calculator-outline' as const },
  { id: 'reasoning', title: 'Reasoning', icon: 'bulb-outline' as const },
  { id: 'general-awareness', title: 'General Awareness', icon: 'newspaper-outline' as const },
  { id: 'science', title: 'Science', icon: 'flask-outline' as const },
  { id: 'computer', title: 'Basics of Computer', icon: 'desktop-outline' as const },
  { id: 'environment', title: 'Environment & Pollution', icon: 'leaf-outline' as const },
  { id: 'technical', title: 'Technical Subject', icon: 'cog-outline' as const },
];

export default function NotesScreen() {
  const results = useCatalogResults();
  const { hasActiveSubscription } = useAuth();
  const openNotes = (title: string) => {
    if (!hasActiveSubscription) {
      sendToPlans();
      return;
    }
    results.show(title, () => loadCourseItems('rrb', 'notes', { search: title }));
  };

  return (
    <Screen>
      <PageHeader title="Notes" />
      <ScreenScroll>
        <HeroBanner
          icon="book"
          eyebrow="RRB"
          title="Study notes"
          subtitle="Complete syllabus coverage for all RRB exams"
          gradient={Brand.teal}
        />
        <MenuStack>
          {NOTES_SUBJECTS.map((item, index) => (
            <MenuRow
              key={item.id}
              title={item.title}
              icon={item.icon}
              index={index}
              onPress={() => openNotes(item.title)}
            />
          ))}
        </MenuStack>
      </ScreenScroll>
      <ApiResultsModal visible={results.visible} title={results.title} loading={results.loading} items={results.items} emptyMessage={results.emptyMessage} onClose={results.close} />
    </Screen>
  );
}
