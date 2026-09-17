import { Brand } from '@/constants/brand';
import { CourseTestScreen } from '@/components/course-test-screen';

export default function TestScreen() {
  return (
    <CourseTestScreen
      slug="rrb"
      subtitle="Groups published for RRB. Tap a paper to start the test."
      icon="create"
      gradient={Brand.teal}
    />
  );
}
