import { Brand } from '@/constants/brand';
import { CourseHubScreen } from '@/components/course-hub';

export default function TNPSCScreen() {
  return (
    <CourseHubScreen
      slug="tnpsc"
      title="TNPSC"
      eyebrow="Govt exams"
      heroTitle="Tamil Nadu Public Service Commission"
      heroSubtitle="Open a group, then school books, videos or tests"
      icon="library"
      gradient={Brand.indigoSoft}
    />
  );
}
