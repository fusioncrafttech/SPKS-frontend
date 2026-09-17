import { Brand } from '@/constants/brand';
import { CourseTestScreen } from '@/components/course-test-screen';

export default function TestScreen() {
  return (
    <CourseTestScreen
      slug="tnusrb"
      subtitle="Groups published for TNUSRB. Tap a paper to start the test."
      icon="create"
      gradient={Brand.blue}
    />
  );
}
