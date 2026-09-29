import { useQuery } from '@tanstack/react-query';

import { studentDataService } from '@/services/student';

import { dailyReviewCards } from '../logic/catalog';

export const dueCardsKey = ['student', 'dueCards'] as const;

/** Cartes de la révision du jour, partagées par Flashcards Choix et la séance. */
export function useDailyReview() {
  const due = useQuery({ queryKey: dueCardsKey, queryFn: () => studentDataService.dueCards() });
  return dailyReviewCards(due.data ?? []);
}
