import { Brand } from '@/constants/brand';
import { CourseHubScreen } from '@/components/course-hub';

export default function RRBScreen() {
  return (
    <CourseHubScreen
      slug="rrb"
      title="RRB"
      eyebrow="Transport"
      heroTitle="Railway Recruitment Board"
      heroSubtitle="Open a group, then subjects, notes, videos or tests"
      icon="bus"
      gradient={Brand.teal}
    />
  );
}
