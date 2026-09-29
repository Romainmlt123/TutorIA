import { useQuery } from '@tanstack/react-query';

import { studentDataService, type StudentOverview } from '@/services/student';

export const studentKeys = {
  overview: ['student', 'overview'] as const,
  chapters: ['student', 'chapters'] as const,
  activity: ['student', 'activity'] as const,
  mastery: ['student', 'mastery'] as const,
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

/** XP, série et activité du jour de l'élève (partagés par l'Accueil, les Flashcards et les Stats). */
export function useStudentOverview(): StudentOverview {
  const query = useQuery({
    queryKey: studentKeys.overview,
    queryFn: () => studentDataService.overview(),
  });
  return query.data ?? EMPTY;
}

export function useStudentChapters() {
  const query = useQuery({
    queryKey: studentKeys.chapters,
    queryFn: () => studentDataService.chapters(),
  });
  return query.data ?? [];
}
