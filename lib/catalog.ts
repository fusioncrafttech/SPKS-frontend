import { Alert, Linking } from 'react-native';

import { api, ApiError, asList } from './api';

export type Course = {
  id: string;
  name?: string;
  slug?: string;
  title?: string;
  description?: string;
  subtitle?: string;
  imageUrl?: string | null;
  icon?: string | null;
};

export type CatalogItem = {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  summary?: string;
  fileUrl?: string | null;
  videoUrl?: string | null;
  sourceUrl?: string | null;
  youtubeId?: string | null;
  thumbnailUrl?: string | null;
  category?: string;
  date?: string;
  duration?: string | number;
  totalQuestions?: number;
  groupId?: string;
};

export type CourseKind = 'notes' | 'tests' | 'videos' | 'books' | 'outside-sources' | 'content' | 'groups';

const COURSE_ROUTES: { match: string; route: '/tnpsc' | '/rrb' | '/tnusrb' | '/current-affairs' }[] = [
  { match: 'tnpsc', route: '/tnpsc' },
  { match: 'rrb', route: '/rrb' },
  { match: 'tnusrb', route: '/tnusrb' },
  { match: 'current', route: '/current-affairs' },
];

export function courseRoute(course: Pick<Course, 'id' | 'name' | 'slug' | 'title'>) {
  const key = `${course.slug || ''} ${course.name || ''} ${course.title || ''}`.toLowerCase();
  const match = COURSE_ROUTES.find((item) => key.includes(item.match));
  return match?.route;
}

export async function listCourses() {
  return asList<Course>(await api.get<Course[]>('/api/courses', { limit: 50 }));
}

export async function findCourse(slug: string) {
  const courses = await listCourses();
  const needle = slug.toLowerCase();
  return (
    courses.find((course) => course.slug?.toLowerCase() === needle) ||
    courses.find((course) => `${course.name || ''} ${course.title || ''}`.toLowerCase().includes(needle)) ||
    null
  );
}

export async function loadCourseItems(slug: string, kind: CourseKind, query?: Record<string, string | number | undefined>) {
  const course = await findCourse(slug);
  if (!course) {
    throw new ApiError('This course is not available from the server yet.', 404);
  }
  return asList<CatalogItem>(await api.get<CatalogItem[]>(`/api/courses/${course.id}/${kind}`, query));
}

export function itemTitle(item: CatalogItem) {
  return item.title || item.name || 'Untitled';
}

export function itemSubtitle(item: CatalogItem) {
  return item.summary || item.description || (item.date ? String(item.date) : '') || '';
}

export async function openCatalogItem(item: CatalogItem) {
  const url =
    item.fileUrl ||
    item.videoUrl ||
    item.sourceUrl ||
    (item.youtubeId ? `https://www.youtube.com/watch?v=${item.youtubeId}` : null);

  if (url) {
    await Linking.openURL(url);
    return;
  }

  Alert.alert(itemTitle(item), itemSubtitle(item) || 'No file or video link is available yet.');
}
