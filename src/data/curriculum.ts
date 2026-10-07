import { cityById } from '@/features/explorer/content';

import { chapters } from './mock/chapters';
import type { Chapter, SubjectId } from './types';

/**
 * Contenus pédagogiques (programme de 4e), gardés dans l'app : la base ne stocke que leurs identifiants.
 */
/**
 * Chapitre du catalogue, ou ville d'Explorer : les séances des niveaux portent l'identifiant de la
 * ville (`maths-relatifs`), que le tuteur libre, les statistiques et l'espace Parents reprennent.
 * Le titre d'une ville est celui du chapitre du référentiel (« Nombres relatifs »).
 */
export function chapterById(chapterId: string): Chapter | undefined {
  const chapter = chapters.find((c) => c.id === chapterId);
  if (chapter) return chapter;
  const place = cityById(chapterId);
  if (!place) return undefined;
  const { city, island } = place;
  const title = city.source.includes(' · ') ? city.source.split(' · ').at(-1)! : city.name;
  return { id: city.id, subjectId: island.subjectId, title };
}

export function chaptersOfSubject(subjectId: SubjectId): readonly Chapter[] {
  return chapters.filter((c) => c.subjectId === subjectId);
}

export function chapterTitle(chapterId: string): string {
  return chapterById(chapterId)?.title ?? '';
}
