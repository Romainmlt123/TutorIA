/** Part de l'objectif du jour réalisée, de 0 à 1. */
export function goalProgress(done: number, target: number): number {
  return target > 0 ? Math.min(1, done / target) : 0;
}

/** Séances visées chaque jour (carte « Objectif du jour »). */
export const DAILY_SESSIONS_TARGET = 3;

/** Leçons d'un chapitre (carte « Reprendre ») : une par séance, cinq au plus. */
export const LESSONS_PER_CHAPTER = 5;

export function currentLesson(sessions: number): number {
  return Math.min(LESSONS_PER_CHAPTER, Math.max(1, sessions + 1));
}

/** Maîtrise d'une matière : moyenne des chapitres travaillés, de 0 à 1. */
export function subjectMastery(
  chapters: readonly { subjectId: string; mastery: number | null; sessions: number }[],
  subjectId: string,
): number {
  const worked = chapters.filter(
    (c) => c.subjectId === subjectId && c.sessions > 0 && c.mastery !== null,
  );
  if (worked.length === 0) return 0;
  return worked.reduce((sum, c) => sum + (c.mastery ?? 0), 0) / worked.length;
}
