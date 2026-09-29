import type { AnswerIndex, Flashcard } from '@/data/types';
import { fr } from '@/i18n/fr';

/** XP gagnés par carte répondue : l'effort compte, même quand la réponse n'est pas la bonne. */
export const XP_PER_CARD = 5;

export type SessionState = {
  cards: readonly Flashcard[];
  index: number;
  picked: AnswerIndex | null;
  known: readonly string[];
  toReview: readonly string[];
};

export type SessionAction =
  { type: 'pick'; option: AnswerIndex } | { type: 'next' } | { type: 'restart' };

export type OptionState = 'idle' | 'correct' | 'wrongPick' | 'dimmed';

export function createSession(cards: readonly Flashcard[]): SessionState {
  return { cards, index: 0, picked: null, known: [], toReview: [] };
}

export function currentCard(state: SessionState): Flashcard | undefined {
  return state.cards[state.index];
}

export function isDone(state: SessionState): boolean {
  return state.index >= state.cards.length;
}

export function isAnswered(state: SessionState): boolean {
  return state.picked !== null;
}

export function isCorrect(state: SessionState): boolean {
  const card = currentCard(state);
  return card !== undefined && state.picked === card.answerIndex;
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'pick':
      // Une seule réponse par carte.
      if (isDone(state) || isAnswered(state)) return state;
      return { ...state, picked: action.option };
    case 'next': {
      const card = currentCard(state);
      if (!card || !isAnswered(state)) return state;
      const right = state.picked === card.answerIndex;
      return {
        ...state,
        index: state.index + 1,
        picked: null,
        known: right ? [...state.known, card.id] : state.known,
        toReview: right ? state.toReview : [...state.toReview, card.id],
      };
    }
    case 'restart':
      return createSession(state.cards);
  }
}

/** Avancement affiché : cartes terminées / total (la carte en cours n'est pas comptée). */
export function progress(state: SessionState): number {
  if (state.cards.length === 0) return 0;
  return Math.min(state.index, state.cards.length) / state.cards.length;
}

export function xpEarned(state: SessionState): number {
  return (state.known.length + state.toReview.length) * XP_PER_CARD;
}

export function optionState(state: SessionState, option: AnswerIndex): OptionState {
  const card = currentCard(state);
  if (!card || state.picked === null) return 'idle';
  if (option === card.answerIndex) return 'correct';
  if (option === state.picked) return 'wrongPick';
  return 'dimmed';
}

export type Feedback = { tone: 'idle' | 'right' | 'wrong'; text: string };

/** Retour bienveillant sous la grille : on explique toujours la bonne réponse. */
export function feedback(state: SessionState): Feedback {
  const card = currentCard(state);
  if (!card || state.picked === null) return { tone: 'idle', text: fr.flashcards.feedbackIdle };
  if (state.picked === card.answerIndex) {
    return { tone: 'right', text: fr.flashcards.feedbackRight(card.explanation) };
  }
  return {
    tone: 'wrong',
    text: fr.flashcards.feedbackWrong(card.options[card.answerIndex], card.explanation),
  };
}
