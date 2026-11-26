import { chaptersOfSubject } from '@/data/curriculum';
import type { OnboardingAnswers } from '@/data/types';
import { buildStudyPlan } from '@/features/onboarding/logic/onboarding';

/** Part de l'objectif du jour réalisée, de 0 à 1. */
export function goalProgress(done: number, target: number): number {
  return target > 0 ? Math.min(1, done / target) : 0;
}

/** Séances visées chaque jour (carte « Objectif du jour »). */
export const DAILY_SESSIONS_TARGET = 3;

/** Leçons d'un chapitre (carte « Reprendre ») : une par séance, cinq au plus. */
export const LESSONS_PER_CHAPTER = 5;

/** Durée annoncée de la première séance (J1, v2.19). */
export const FIRST_SESSION_MINUTES = 10;

/** Une matière est « à découvrir » tant qu'aucun de ses chapitres n'a eu de séance. */
export function isFreshSubject(
  chapters: readonly { subjectId: string; sessions: number }[],
  subjectId: string,
): boolean {
  return !chapters.some((c) => c.subjectId === subjectId && c.sessions > 0);
}

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

/** Premier chapitre du parcours sans auto-évaluation. */
export const FIRST_CHAPTER = 'maths-equations';

/**
 * Première leçon du parcours (O5, J1) : le premier chapitre de la matière la moins à l'aise d'après
 * l'auto-évaluation, sinon les équations.
 */
export function firstChapterId(selfAssessment: OnboardingAnswers['selfAssessment'] | undefined) {
  const subjectId = selfAssessment ? buildStudyPlan(selfAssessment, 1)[0]?.subjectId : undefined;
  return (subjectId && chaptersOfSubject(subjectId)[0]?.id) || FIRST_CHAPTER;
}
