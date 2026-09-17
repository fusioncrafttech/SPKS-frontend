import { Brand } from '@/constants/brand';
import { CourseHubScreen } from '@/components/course-hub';

export default function TNUSRBScreen() {
  return (
    <CourseHubScreen
      slug="tnusrb"
      title="TNUSRB"
      eyebrow="Police"
      heroTitle="Tamil Nadu Uniformed Services"
      heroSubtitle="Open a group, then subjects, notes, videos or tests"
      icon="shield-checkmark"
      gradient={Brand.blue}
    />
  );
}
