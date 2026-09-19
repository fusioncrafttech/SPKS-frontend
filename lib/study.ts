import { router } from 'expo-router';

import { api, asList, toAbsoluteApiUrl } from './api';
import { CatalogItem, asCatalogItem, getCourse, itemTitle } from './catalog';
import { promptPremium, startTestFlow } from './tests';

export type NamedItem = {
  id: string;
  title: string;
  subtitle?: string;
  isLocked?: boolean;
  isPremium?: boolean;
  pdfViewUrl?: string | null;
  viewUrl?: string | null;
};

export type GroupDetail = {
  id: string;
  title: string;
  subtitle?: string;
};

function isVisible(item: Record<string, any>) {
  if (!item?.id) return false;
  if (item.isActive === false || item.active === false) return false;
  if (item.isPublished === false || item.published === false) return false;
  return true;
}

function mapNamed(item: Record<string, any>): NamedItem | null {
  if (!isVisible(item)) return null;
  return {
    id: String(item.id),
    title: String(item.title || item.name || item.heading || 'Untitled'),
    subtitle: item.subtitle || item.description || item.summary || '',
    isLocked: Boolean(item.isLocked),
    isPremium: Boolean(item.isPremium),
    pdfViewUrl: item.pdfViewUrl || null,
    viewUrl: item.viewUrl || null,
  };
}

function mapNamedList(items: Record<string, any>[]) {
  return items.map(mapNamed).filter((item): item is NamedItem => Boolean(item));
}

function mapCatalogList(items: Record<string, any>[]) {
  return items.filter(isVisible).map((item, index) => asCatalogItem(item, index));
}

export async function listCourseGroups(courseSlug: string) {
  const course = await getCourse(courseSlug);
  if (!course) return [] as NamedItem[];
  return mapNamedList(asList<Record<string, any>>(await api.get(`/api/courses/${course.id}/groups`)));
}

export async function getGroup(groupId: string): Promise<GroupDetail | null> {
  try {
    const data = await api.get<Record<string, any>>(`/api/groups/${groupId}`);
    const group = data?.id ? data : data?.group;
    if (!group?.id) return { id: groupId, title: 'Group' };
    return {
      id: String(group.id),
      title: String(group.title || group.name || 'Group'),
      subtitle: group.description || group.subtitle || '',
    };
  } catch {
    return { id: groupId, title: 'Group' };
  }
}

export async function listGroupClasses(groupId: string) {
  return mapNamedList(asList<Record<string, any>>(await api.get(`/api/groups/${groupId}/classes`)));
}

export async function listGroupSubjects(groupId: string) {
  return mapNamedList(asList<Record<string, any>>(await api.get(`/api/groups/${groupId}/subjects`)));
}

export async function listClassSubjects(classId: string) {
  return mapNamedList(asList<Record<string, any>>(await api.get(`/api/classes/${classId}/subjects`)));
}

export async function listSubjectChapters(subjectId: string) {
  return mapNamedList(asList<Record<string, any>>(await api.get(`/api/subjects/${subjectId}/chapters`)));
}

export async function listChapterContent(chapterId: string) {
  return mapCatalogList(asList<Record<string, any>>(await api.get(`/api/chapters/${chapterId}/content`)));
}

export async function listChapterLessons(chapterId: string) {
  return mapNamedList(asList<Record<string, any>>(await api.get(`/api/chapters/${chapterId}/lessons`)));
}

export async function getLesson(lessonId: string) {
  const data = await api.get<Record<string, any>>(`/api/lessons/${lessonId}`);
  const lesson = data?.id ? data : data?.lesson || data?.data;
  return lesson || data;
}

export async function listGroupResource(groupId: string, kind: 'books' | 'notes' | 'outside-sources' | 'videos' | 'tests') {
  const items = mapCatalogList(asList<Record<string, any>>(await api.get(`/api/groups/${groupId}/${kind}`)));
  if (kind === 'tests') {
    return items.map((item) => ({ ...item, category: 'test', totalQuestions: item.totalQuestions || 1 }));
  }
  if (kind === 'videos') {
    return items.map((item) => ({ ...item, contentType: 'video' }));
  }
  return items;
}

export async function getContent(contentId: string) {
  try {
    return await api.get<Record<string, any>>(`/api/content/${contentId}`);
  } catch {
    return api.get<Record<string, any>>(`/api/current-affairs/${contentId}`);
  }
}

export function lessonPdfViewUrl(lessonId: string, lesson?: Record<string, any> | null) {
  const path = String(lesson?.pdfViewUrl || lesson?.pdf_view_url || `/api/lessons/${lessonId}/pdf`);
  return path.startsWith('http') ? path : toAbsoluteApiUrl(path);
}

export function contentViewUrl(contentId: string, content?: Record<string, any> | null) {
  const path = String(content?.viewUrl || content?.pdfViewUrl || `/api/content/${contentId}/view`);
  return path.startsWith('http') ? path : toAbsoluteApiUrl(path);
}

export function hasLessonPdf(lesson?: Record<string, any> | null) {
  return Boolean(lesson?.pdfViewUrl || lesson?.pdf_view_url || lesson?.pdfUrl || lesson?.pdf_url);
}

export function hasContentPdf(content?: Record<string, any> | null) {
  if (!content) return false;
  if (content.viewUrl || content.pdfViewUrl || content.fileUrl || content.pdfUrl) return true;
  const type = String(content.contentType || content.type || content.fileType || '').toLowerCase();
  if (type.includes('pdf') || type === 'file' || type === 'document') return true;
  const file = String(content.sourceUrl || content.url || '');
  return /\.pdf($|\?)/i.test(file);
}

export async function getVideo(videoId: string) {
  return api.get<Record<string, any>>(`/api/videos/${videoId}`);
}

export async function recordVideoView(videoId: string) {
  try {
    await api.post(`/api/videos/${videoId}/view`);
  } catch {
    // Viewing should not block playback.
  }
}

export async function toggleBookmark(kind: 'content' | 'videos' | 'current-affairs', id: string, bookmarked: boolean) {
  const path = `/api/${kind}/${id}/bookmark`;
  if (bookmarked) await api.delete(path);
  else await api.post(path);
}

export async function markLessonProgress(lessonId: string) {
  try {
    await api.post(`/api/lessons/${lessonId}/progress`);
  } catch {
    // Optional tracking.
  }
}

export async function completeLesson(lessonId: string) {
  try {
    await api.post(`/api/lessons/${lessonId}/complete`);
  } catch {
    // Optional tracking.
  }
}

export type ContinueLearning = {
  lessonId?: string;
  contentId?: string;
  videoId?: string;
  testId?: string;
  title?: string;
  courseName?: string;
};

export async function getContinueLearning() {
  try {
    return await api.get<ContinueLearning | null>('/api/users/me/continue-learning');
  } catch {
    return null;
  }
}

export async function getStreak() {
  try {
    const data = await api.get<Record<string, any>>('/api/users/me/streak');
    return Number(data?.currentStreak ?? data?.dailyStreak ?? data?.streak ?? data?.count ?? 0);
  } catch {
    return 0;
  }
}

export async function getActivity() {
  try {
    return asList<Record<string, any>>(await api.get('/api/users/me/activity'));
  } catch {
    return [];
  }
}

export async function getOverallProgress() {
  try {
    return await api.get<Record<string, any>>('/api/users/me/progress');
  } catch {
    return null;
  }
}

export async function getHelpContact() {
  try {
    return await api.get<Record<string, any>>('/api/help/contact');
  } catch {
    return null;
  }
}

export async function createSupportTicket(input: { subject: string; message: string }) {
  return api.post('/api/support/tickets', input);
}

export async function getRefundPolicy() {
  try {
    return await api.get<{ title?: string; content?: string }>('/api/legal/refund-policy');
  } catch {
    return null;
  }
}

export function isLockedItem(item: { isLocked?: boolean }) {
  return Boolean(item.isLocked);
}

export async function openStudyItem(item: CatalogItem, kind: 'content' | 'video' | 'test' | 'auto' = 'auto') {
  if (item.isLocked) {
    promptPremium(`${itemTitle(item)} is locked on the free plan.`);
    return;
  }

  const looksLikeTest = kind === 'test' || Boolean(item.totalQuestions) || item.category === 'test';
  if (looksLikeTest) {
    await startTestFlow(item.id, item.isLocked);
    return;
  }

  const looksLikeVideo = kind === 'video' || item.contentType === 'video' || Boolean(item.youtubeId || item.videoUrl);
  if (looksLikeVideo) {
    if (item.lessonId) void markLessonProgress(String(item.lessonId));
    router.push(`/video/${item.id}` as any);
    return;
  }

  if (item.lessonId) void markLessonProgress(String(item.lessonId));
  if (item.contentType === 'lesson') {
    router.push(`/lesson/${item.id}` as any);
    return;
  }
  router.push(`/content/${item.id}` as any);
}

export async function openContinueItem(item: ContinueLearning | null | undefined) {
  if (!item) return false;
  if (item.lessonId) {
    void markLessonProgress(item.lessonId);
    router.push(`/lesson/${item.lessonId}` as any);
    return true;
  }
  if (item.testId) {
    await startTestFlow(item.testId);
    return true;
  }
  if (item.videoId) {
    router.push(`/video/${item.videoId}` as any);
    return true;
  }
  if (item.contentId) {
    router.push(`/content/${item.contentId}` as any);
    return true;
  }
  return false;
}

