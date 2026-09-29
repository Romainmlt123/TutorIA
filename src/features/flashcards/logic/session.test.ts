import type { Flashcard } from '@/data/types';

import {
  createSession,
  feedback,
  isDone,
  optionState,
  progress,
  sessionReducer,
  xpEarned,
  type SessionAction,
  type SessionState,
} from './session';

const card = (id: string, answerIndex: 0 | 1 | 2 | 3): Flashcard => ({
  id,
  chapterId: 'maths-equations',
  question: `Question ${id}`,
  options: ['a', 'b', 'c', 'd'],
  answerIndex,
  explanation: 'On divise par 2.',
});

const deck = [card('1', 1), card('2', 0), card('3', 3)];
const run = (actions: SessionAction[], state: SessionState = createSession(deck)) =>
  actions.reduce(sessionReducer, state);

describe('session de flashcards (QCM)', () => {
  it('range une bonne réponse dans « Je sais » et une mauvaise dans « À revoir »', () => {
    const state = run([
      { type: 'pick', option: 1 },
      { type: 'next' },
      { type: 'pick', option: 2 },
      { type: 'next' },
    ]);
    expect(state.known).toEqual(['1']);
    expect(state.toReview).toEqual(['2']);
    expect(state.index).toBe(2);
  });

  it('refuse une deuxième réponse sur la même carte', () => {
    const state = run([
      { type: 'pick', option: 2 },
      { type: 'pick', option: 1 },
    ]);
    expect(state.picked).toBe(2);
  });

  it('ne passe pas à la carte suivante sans réponse', () => {
    expect(run([{ type: 'next' }]).index).toBe(0);
  });

  it('révèle la bonne réponse et atténue les autres après un mauvais choix', () => {
    const state = run([{ type: 'pick', option: 3 }]);
    expect([0, 1, 2, 3].map((o) => optionState(state, o as 0 | 1 | 2 | 3))).toEqual([
      'dimmed',
      'correct',
      'dimmed',
      'wrongPick',
    ]);
  });

  it('explique la réponse avec bienveillance, sans jamais dire « faux »', () => {
    const right = feedback(run([{ type: 'pick', option: 1 }]));
    const wrong = feedback(run([{ type: 'pick', option: 0 }]));
    expect(right).toEqual({
      tone: 'right',
      text: 'Bien joué ! On divise par 2. Carte rangée dans « Je sais ».',
    });
    expect(wrong.tone).toBe('wrong');
    expect(wrong.text).toBe('Pas tout à fait : c’était b. On divise par 2. On la revoit demain.');
    expect(`${right.text} ${wrong.text}`.toLowerCase()).not.toMatch(/faux|tort|erreur/);
  });

  it('termine la session, compte l’XP de chaque carte répondue et peut recommencer', () => {
    const answerAll: SessionAction[] = deck.flatMap((c) => [
      { type: 'pick', option: c.answerIndex },
      { type: 'next' },
    ]);
    const done = run(answerAll);
    expect(isDone(done)).toBe(true);
    expect(progress(done)).toBe(1);
    expect(xpEarned(done)).toBe(15);
    expect(sessionReducer(done, { type: 'restart' })).toEqual(createSession(deck));
  });

  it('donne +60 XP pour une session de 12 cartes, même avec des erreurs', () => {
    const twelve = Array.from({ length: 12 }, (_, i) => card(String(i), 0));
    const state = run(
      twelve.flatMap((_, i) => [{ type: 'pick', option: i % 3 === 0 ? 1 : 0 }, { type: 'next' }]),
      createSession(twelve),
    );
    expect(xpEarned(state)).toBe(60);
  });
});
