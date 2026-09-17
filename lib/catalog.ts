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
  lessonId?: string;
  isLocked?: boolean;
  isPremium?: boolean;
  isBookmarked?: boolean;
  contentType?: string;
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

export async function getCourse(idOrSlug: string) {
  try {
    const data = await api.get<any>(`/api/courses/${idOrSlug}`);
    const course = data?.id ? data : data?.course || (Array.isArray(data) ? data[0] : null);
    if (course?.id) return course as Course;
  } catch {
    // Fall back to scanning the course list.
  }
  return findCourse(idOrSlug);
}

export async function findCourse(slug: string) {
  const courses = await listCourses();
  const needle = slug.toLowerCase();
  return (
    courses.find((course) => course.id === slug) ||
    courses.find((course) => course.slug?.toLowerCase() === needle) ||
    courses.find((course) => `${course.name || ''} ${course.title || ''}`.toLowerCase().includes(needle)) ||
    null
  );
}

export async function loadCourseItems(slug: string, kind: CourseKind, query?: Record<string, string | number | undefined>) {
  const course = await getCourse(slug);
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

export function asCatalogItem(item: Record<string, any>, index = 0): CatalogItem {
  return {
    id: String(item.id || index),
    title: item.title || item.name,
    name: item.name,
    description: item.description,
    summary: item.summary,
    fileUrl: item.fileUrl,
    videoUrl: item.videoUrl,
    sourceUrl: item.sourceUrl,
    youtubeId: item.youtubeId,
    thumbnailUrl: item.thumbnailUrl,
    category: item.category,
    date: item.date,
    duration: item.duration,
    totalQuestions: item.totalQuestions,
    groupId: item.groupId,
    lessonId: item.lessonId,
    isLocked: Boolean(item.isLocked),
    isPremium: Boolean(item.isPremium),
    isBookmarked: Boolean(item.isBookmarked),
    contentType: item.contentType,
  };
}

export async function openCatalogItem(item: CatalogItem) {
  const { openStudyItem } = await import('./study');
  await openStudyItem(item);
}
