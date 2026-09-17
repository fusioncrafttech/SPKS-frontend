import { ApiResultsModal } from '@/components/ui/api-results-modal';
import { HeroBanner } from '@/components/ui/hero-banner';
import { MenuRow, MenuStack } from '@/components/ui/menu-row';
import { PageHeader } from '@/components/ui/page-header';
import { Screen, ScreenScroll } from '@/components/ui/screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { Brand } from '@/constants/brand';
import { useCatalogResults } from '@/hooks/use-catalog-results';
import { loadCourseItems } from '@/lib/catalog';

const GENERAL_KNOWLEDGE_UNITS = [
  { id: 'gk-1', title: 'Unit 1', icon: 'flask-outline' as const },
  { id: 'gk-2', title: 'Unit 2', icon: 'newspaper-outline' as const },
  { id: 'gk-3', title: 'Unit 3', icon: 'earth-outline' as const },
  { id: 'gk-4', title: 'Unit 4', icon: 'business-outline' as const },
  { id: 'gk-5', title: 'Unit 5', icon: 'scale-outline' as const },
  { id: 'gk-6', title: 'Unit 6', icon: 'stats-chart-outline' as const },
  { id: 'gk-7', title: 'Unit 7', icon: 'flag-outline' as const },
  { id: 'gk-8', title: 'Unit 8', icon: 'bulb-outline' as const },
];

const TAMIL_UNITS = [
  { id: 'tamil-1', title: 'அலகு:1 இலக்கணம் (25 வினாக்கள்)' },
  { id: 'tamil-2', title: 'அலகு :2 சொல்லகராதி (15 வினாக்கள்)' },
  { id: 'tamil-3', title: 'அலகு :3 எழுதும் திறன் (15 வினாக்கள்)' },
  { id: 'tamil-4', title: 'அலகு :4 கலைச்சொற்கள் (10 வினாக்கள்)' },
  { id: 'tamil-5', title: 'அலகு :5 வாசித்தல்- புரிந்து கொள்ளும் திறன் (15 வினாக்கள்)' },
  { id: 'tamil-6', title: 'அலகு :6 எளிய மொழிபெயர்ப்பு (5 வினாக்கள்)' },
  { id: 'tamil-7', title: 'அலகு :7 இலக்கியம், தமிழ் அறிஞர்களும், தமிழ் தொண்டும் (15 வினாக்கள்)' },
];

export default function BookScreen() {
  const results = useCatalogResults();

  const handleUnitPress = (title: string) => {
    results.show(title, () => loadCourseItems('tnpsc', 'books', { search: title }));
  };

  return (
    <Screen>
      <PageHeader title="Book" />
      <ScreenScroll>
        <HeroBanner
          icon="book"
          eyebrow="Groups 1 to 5"
          title="TNPSC books"
          subtitle="General Knowledge and Tamil units. Select a unit to study."
          gradient={Brand.indigoSoft}
        />
        <SectionHeading title="1. General Knowledge" />
        <MenuStack>
          {GENERAL_KNOWLEDGE_UNITS.map((item, index) => (
            <MenuRow
              key={item.id}
              title={item.title}
              icon={item.icon}
              index={index}
              onPress={() => handleUnitPress(item.title)}
            />
          ))}
        </MenuStack>
        <SectionHeading title="2. Tamil" />
        <MenuStack>
          {TAMIL_UNITS.map((item, index) => (
            <MenuRow
              key={item.id}
              title={item.title}
              icon="reader-outline"
              index={index}
              onPress={() => handleUnitPress(item.title)}
            />
          ))}
        </MenuStack>
      </ScreenScroll>
      <ApiResultsModal visible={results.visible} title={results.title} loading={results.loading} items={results.items} emptyMessage={results.emptyMessage} onClose={results.close} />
    </Screen>
  );
}
