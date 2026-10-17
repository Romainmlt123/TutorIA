import { useQuery } from '@tanstack/react-query';

import { studentDataService, type StudentOverview } from '@/services/student';

export const studentKeys = {
  overview: ['student', 'overview'] as const,
  chapters: ['student', 'chapters'] as const,
  activity: ['student', 'activity'] as const,
  mastery: ['student', 'mastery'] as const,
  /** Réponses de l'onboarding (auto-évaluation, objectifs) : Profil et premier jour de l'Accueil. */
  onboarding: ['onboarding', 'answers'] as const,
};

const EMPTY: StudentOverview = {
  xp: 0,
  streakDays: 0,
  recordStreak: 0,
  todayMinutes: 0,
  todaySessions: 0,
  dailyMinutes: 15,
  lastChapter: null,
};

const overviewQuery = {
  queryKey: studentKeys.overview,
  queryFn: () => studentDataService.overview(),
};
const chaptersQuery = {
  queryKey: studentKeys.chapters,
  queryFn: () => studentDataService.chapters(),
};

/** XP, série et activité du jour de l'élève (partagés par l'Accueil, les Flashcards et les Stats). */
export function useStudentOverview(): StudentOverview {
  return useQuery(overviewQuery).data ?? EMPTY;
}

export function useStudentChapters() {
  return useQuery(chaptersQuery).data ?? [];
}

/**
 * Vue d'ensemble et chapitres lus : avant, l'Accueil ne sait pas encore si c'est le premier jour
 * (il ne doit pas l'afficher le temps du chargement).
 */
export function useStudentProgressReady(): boolean {
  const overview = useQuery(overviewQuery);
  const chapters = useQuery(chaptersQuery);
  return overview.isSuccess && chapters.isSuccess;
}
