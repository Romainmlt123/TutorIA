import { chapters } from './mock/chapters';
import type { Chapter, SubjectId } from './types';

/**
 * Contenus pédagogiques (programme de 4e), gardés dans l'app : la base ne stocke que leurs identifiants.
 */
export function chapterById(chapterId: string): Chapter | undefined {
  return chapters.find((c) => c.id === chapterId);
}

export function chaptersOfSubject(subjectId: SubjectId): readonly Chapter[] {
  return chapters.filter((c) => c.subjectId === subjectId);
}

export function chapterTitle(chapterId: string): string {
  return chapterById(chapterId)?.title ?? '';
}
