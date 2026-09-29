import { useState } from 'react';

import { subjects } from '@/data/mock/subjects';
import type { SubjectId } from '@/data/types';
import { useStudentOverview } from '@/lib/session/useStudentOverview';

import {
  cardCountOfSubject,
  cardsOfChapter,
  chapterById,
  chaptersWithCards,
  estimateMinutes,
  subjectsOfCards,
} from '../logic/catalog';
import { useDailyReview } from './useDailyReview';

const isSubject = (value: string | undefined): value is SubjectId =>
  subjects.some((s) => s.id === value);

/** Catalogue de flashcards : matière et chapitre sélectionnés, révision du jour. */
export function useFlashcardCatalog(subjectParam?: string, chapterParam?: string) {
  const fromChapter = chapterById(chapterParam ?? '');
  const paramsKey = `${subjectParam ?? ''}|${chapterParam ?? ''}`;
  const initialSubject = (): SubjectId =>
    fromChapter?.subjectId ?? (isSubject(subjectParam) ? subjectParam : 'maths');
  const [subjectId, setSubjectId] = useState<SubjectId>(initialSubject);
  const [chapterBySubject, setChapterBySubject] = useState<Partial<Record<SubjectId, string>>>(
    fromChapter ? { [fromChapter.subjectId]: fromChapter.id } : {},
  );
  const [lastParams, setLastParams] = useState(paramsKey);

  // Arrivée depuis l'Accueil ou les Stats : on présélectionne la matière et le chapitre.
  if (paramsKey !== lastParams) {
    setLastParams(paramsKey);
    setSubjectId(initialSubject());
    if (fromChapter) {
      setChapterBySubject((current) => ({ ...current, [fromChapter.subjectId]: fromChapter.id }));
    }
  }

  const chapters = chaptersWithCards(subjectId).map((chapter) => {
    const cardCount = cardsOfChapter(chapter.id).length;
    return { ...chapter, cardCount, minutes: estimateMinutes(cardCount, 'chapter') };
  });
  const selectedChapter = chapters.find((c) => c.id === chapterBySubject[subjectId]) ?? chapters[0];

  const dailyCards = useDailyReview();
  const overview = useStudentOverview();
  return {
    subjects: subjects.map((s) => ({ ...s, cardCount: cardCountOfSubject(s.id) })),
    subjectId,
    selectSubject: setSubjectId,
    chapters,
    selectedChapter,
    selectChapter: (chapterId: string) =>
      setChapterBySubject((current) => ({ ...current, [subjectId]: chapterId })),
    dailyReview: {
      cardCount: dailyCards.length,
      minutes: estimateMinutes(dailyCards.length, 'review'),
      subjects: subjectsOfCards(dailyCards).map((id) => ({
        id,
        name: subjects.find((s) => s.id === id)?.name ?? '',
      })),
    },
    streakDays: overview.streakDays,
  };
}
