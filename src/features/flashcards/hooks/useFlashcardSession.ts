import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useReducer, useRef } from 'react';

import { subjects } from '@/data/mock/subjects';
import type { SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import { logError } from '@/lib/logger';
import { useStudentOverview } from '@/lib/session/useStudentOverview';
import { studentDataService } from '@/services/student';

import { cardsOfChapter, chapterById, subjectOfCard } from '../logic/catalog';
import {
  createSession,
  currentCard,
  feedback,
  isAnswered,
  isDone,
  optionState,
  progress,
  sessionReducer,
  xpEarned,
  type SessionAction,
} from '../logic/session';
import { useDailyReview } from './useDailyReview';

/** Session de flashcards : un chapitre, ou la révision du jour (plusieurs matières). */
export function useFlashcardSession(params: { chapter?: string; mode?: string }) {
  const daily = params.mode === 'daily';
  const chapter = chapterById(params.chapter ?? '');
  const dailyCards = useDailyReview();
  const deck = useMemo(
    () => (daily ? dailyCards : cardsOfChapter(chapter?.id ?? '')),
    [daily, dailyCards, chapter?.id],
  );
  const [state, reduce] = useReducer(sessionReducer, deck, createSession);
  const overview = useStudentOverview();
  const queryClient = useQueryClient();
  // Séance créée en base à la première réponse ; la base calcule XP, série et maîtrise.
  const sessionId = useRef<Promise<string> | null>(null);

  const dispatch = (action: SessionAction) => {
    const current = currentCard(state);
    if (action.type === 'pick' && current && !isAnswered(state)) {
      const subject = subjectOfCard(current) ?? chapter?.subjectId ?? 'maths';
      sessionId.current ??= studentDataService.startFlashcards(
        daily ? null : subject,
        daily ? null : (chapter?.id ?? null),
      );
      sessionId.current
        .then((id) =>
          studentDataService.recordAnswer(id, {
            cardId: current.id,
            chapterId: current.chapterId,
            subjectId: subject,
            correct: action.option === current.answerIndex,
          }),
        )
        .then(() => queryClient.invalidateQueries({ queryKey: ['student'] }))
        .catch((error: unknown) => logError('flashcards.record', error));
    }
    if (action.type === 'restart') sessionId.current = null;
    reduce(action);
  };

  const card = currentCard(state);
  const subjectId: SubjectId = (card && subjectOfCard(card)) ?? chapter?.subjectId ?? 'maths';
  const done = isDone(state);
  const title = daily
    ? fr.flashcards.dailyReview
    : (subjects.find((s) => s.id === chapter?.subjectId)?.name ?? '');

  return {
    state,
    dispatch,
    card,
    subjectId,
    title,
    subtitle: done
      ? fr.flashcards.finished
      : fr.flashcards.position(state.index + 1, state.cards.length),
    done,
    answered: isAnswered(state),
    isLast: state.index === state.cards.length - 1,
    progress: progress(state),
    feedback: feedback(state),
    optionState: (option: 0 | 1 | 2 | 3) => optionState(state, option),
    xp: xpEarned(state),
    streakDays: overview.streakDays,
  };
}
