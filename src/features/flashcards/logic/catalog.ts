import { chapterById, chaptersOfSubject } from '@/data/curriculum';
import { flashcards } from '@/data/mock/flashcards';
import type { Chapter, Flashcard, SubjectId } from '@/data/types';

/** Durée estimée : 30 s par carte nouvelle, 24 s par carte déjà vue (révision). */
const SECONDS_PER_CARD = { chapter: 30, review: 24 } as const;

export function estimateMinutes(cardCount: number, mode: keyof typeof SECONDS_PER_CARD): number {
  return Math.max(1, Math.round((cardCount * SECONDS_PER_CARD[mode]) / 60));
}

export function chaptersOf(subjectId: SubjectId): readonly Chapter[] {
  return chaptersOfSubject(subjectId);
}

/** Chapitres qui ont des flashcards (Flashcards Choix n'affiche que ceux-là). */
export function chaptersWithCards(subjectId: SubjectId): readonly Chapter[] {
  return chaptersOf(subjectId).filter((c) => flashcards.some((card) => card.chapterId === c.id));
}

export { chapterById };

export function cardsOfChapter(chapterId: string): readonly Flashcard[] {
  return flashcards.filter((card) => card.chapterId === chapterId);
}

export function subjectOfCard(card: Flashcard): SubjectId | undefined {
  return chapterById(card.chapterId)?.subjectId;
}

export function cardCountOfSubject(subjectId: SubjectId): number {
  const ids = new Set(chaptersOf(subjectId).map((c) => c.id));
  return flashcards.filter((card) => ids.has(card.chapterId)).length;
}

/** Cartes dues aujourd'hui, par matière (répétition espacée simulée). */
export const DAILY_REVIEW_PLAN: readonly { subjectId: SubjectId; count: number }[] = [
  { subjectId: 'maths', count: 8 },
  { subjectId: 'histoire-geo', count: 7 },
  { subjectId: 'anglais', count: 7 },
  { subjectId: 'francais', count: 4 },
  { subjectId: 'svt', count: 4 },
];

/**
 * Révision du jour : les cartes dues (répétition espacée en base) ; sans carte due
 * (premiers jours), une sélection de découverte dans chaque matière.
 */
export function dailyReviewCards(dueCardIds: readonly string[] = []): readonly Flashcard[] {
  const due = dueCardIds.flatMap((id) => flashcards.filter((card) => card.id === id));
  if (due.length > 0) return due;
  return DAILY_REVIEW_PLAN.flatMap(({ subjectId, count }) => {
    const ids = new Set(chaptersOf(subjectId).map((c) => c.id));
    return flashcards.filter((card) => ids.has(card.chapterId)).slice(0, count);
  });
}

/** Matières d'une révision, dans l'ordre de leurs cartes. */
export function subjectsOfCards(cards: readonly Flashcard[]): SubjectId[] {
  const seen: SubjectId[] = [];
  for (const card of cards) {
    const subject = subjectOfCard(card);
    if (subject && !seen.includes(subject)) seen.push(subject);
  }
  return seen;
}
