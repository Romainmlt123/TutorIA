import { levelById } from '../content';
import { applyCalls, parseLevelCall, progressOf, startPlay, type LevelCall } from './levelPlay';

const level = (slug: string) => levelById(`maths-equations.${slug}`)!.level;
const answer = (correct: boolean, hinted = false): LevelCall => ({
  name: 'record_answer',
  correct,
  hinted,
});

function playAll(slug: string, turns: readonly (readonly LevelCall[])[]) {
  const lvl = level(slug);
  let play = startPlay(lvl.id);
  let outcome;
  for (const calls of turns) {
    const turn = applyCalls(lvl, play, calls);
    play = turn.play;
    outcome = turn.outcome ?? outcome;
  }
  return { play, outcome };
}

describe('déroulé d’un niveau', () => {
  it('termine une leçon quand toutes ses étapes sont réussies', () => {
    const lesson = level('isoler-x');
    const { play, outcome } = playAll(
      'isoler-x',
      Array.from({ length: lesson.steps }, () => [{ name: 'complete_step' } as const]),
    );
    expect(play.finished).toBe(true);
    expect(outcome).toEqual({
      levelId: lesson.id,
      score: 1,
      stars: 3,
      passed: true,
      xp: 40,
      correct: 4,
      total: 4,
    });
  });

  it('n’enregistre qu’un jugement de chaque sorte par tour', () => {
    const exercise = level('resoudre-ax-b-c');
    const turn = applyCalls(exercise, startPlay(exercise.id), [
      answer(true),
      answer(true),
      answer(true),
    ]);
    expect(progressOf(exercise, turn.play)).toEqual({ done: 1, total: 5 });
  });

  it('ignore les réponses dans une leçon et les étapes dans des exercices', () => {
    const lesson = level('isoler-x');
    expect(applyCalls(lesson, startPlay(lesson.id), [answer(true)]).progressed).toBe(false);
    const exercise = level('resoudre-ax-b-c');
    expect(
      applyCalls(exercise, startPlay(exercise.id), [{ name: 'complete_step' }]).progressed,
    ).toBe(false);
  });

  it('ne compte jamais une réponse comme aidée en évaluation', () => {
    const { outcome } = playAll(
      'bilan',
      Array.from({ length: 8 }, () => [answer(true, true)]),
    );
    expect(outcome).toMatchObject({ score: 1, stars: 3, passed: true, correct: 8, total: 8 });
  });

  it('calcule le bilan « 5 sur 8 · 63 % » de la maquette X5b', () => {
    const turns = [...Array(5).fill([answer(true)]), ...Array(3).fill([answer(false)])];
    const { outcome } = playAll('bilan', turns);
    expect(outcome).toMatchObject({ correct: 5, total: 8, stars: 1, passed: false, xp: 20 });
    expect(outcome?.score).toBeCloseTo(0.625);
  });

  it('ne change plus rien une fois le niveau terminé', () => {
    const exercise = level('resoudre-ax-b-c');
    const { play } = playAll('resoudre-ax-b-c', Array(5).fill([answer(true)]));
    expect(applyCalls(exercise, play, [answer(false)])).toEqual({ play, progressed: false });
  });
});

describe('lecture des appels d’outils du modèle', () => {
  it('accepte les appels bien formés et ignore les autres', () => {
    expect(parseLevelCall('record_answer', '{"correct":true,"hinted":false}')).toEqual(
      answer(true),
    );
    expect(parseLevelCall('complete_step', '{}')).toEqual({ name: 'complete_step' });
    expect(parseLevelCall('record_answer', '{"correct":"oui"}')).toBeNull();
    expect(parseLevelCall('record_answer', 'pas du json')).toBeNull();
    expect(parseLevelCall('set_score', '{"score":1}')).toBeNull();
  });
});
