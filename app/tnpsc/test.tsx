import { Brand } from '@/constants/brand';
import { CourseTestScreen } from '@/components/course-test-screen';

export default function TestScreen() {
  return (
    <CourseTestScreen
      slug="tnpsc"
      subtitle="Group 1 to 4 and Others come from the API. Tap a paper to start."
      icon="create"
      gradient={Brand.indigo}
    />
  );
}
