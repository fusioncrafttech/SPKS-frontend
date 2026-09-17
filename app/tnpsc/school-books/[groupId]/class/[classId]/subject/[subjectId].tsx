import { Redirect, useLocalSearchParams } from 'expo-router';

export default function NestedSubjectRedirect() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  if (!subjectId) return null;
  return <Redirect href={`/subject/${subjectId}` as any} />;
}
