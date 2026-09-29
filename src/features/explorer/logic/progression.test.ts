import { cityById, islandOf, levelById, pathOf } from '../content';
import {
  cityMastery,
  cityStatus,
  islandPath,
  islandSummary,
  isCleared,
  levelResult,
  mergeAttempt,
  scoreOf,
  starsFor,
  type LevelRecord,
  type RecordedAnswer,
} from './progression';

const maths = islandOf('maths')!;
const equations = cityById('maths-equations')!.city;
const level = (slug: string) => levelById(`maths-equations.${slug}`)!.level;

const right = (n: number, hinted = false): RecordedAnswer[] =>
  Array.from({ length: n }, () => ({ correct: true, hinted }));
const wrong = (n: number): RecordedAnswer[] =>
  Array.from({ length: n }, () => ({ correct: false, hinted: false }));

function finished(slug: string, score: number): [string, LevelRecord] {
  const id = `maths-equations.${slug}`;
  return [id, mergeAttempt(undefined, id, { score, stars: starsFor(score), passed: true, xp: 0 })];
}

describe('étoiles et score', () => {
  it('donne une étoile à 50 %, deux à 70 %, trois à 90 %', () => {
    expect([0.49, 0.5, 0.69, 0.7, 0.89, 0.9, 1].map(starsFor)).toEqual([0, 1, 1, 2, 2, 3, 3]);
  });

  it('compte une réponse aidée pour moitié, sauf en évaluation où elle ne compte pas', () => {
    const answers = [...right(2), ...right(2, true), ...wrong(1)];
    expect(scoreOf('exercices', answers, 5)).toBeCloseTo(0.6);
    expect(scoreOf('evaluation', answers, 5)).toBeCloseTo(0.4);
  });

  it('rapporte le score aux questions prévues, sans dépasser 100 %', () => {
    expect(scoreOf('exercices', right(3), 5)).toBeCloseTo(0.6);
    expect(scoreOf('exercices', right(8), 5)).toBe(1);
  });
});

describe('résultat d’un niveau', () => {
  it('valide une leçon terminée, avec 3 étoiles et 40 XP comme la maquette X5', () => {
    expect(levelResult(level('isoler-x'), [])).toEqual({
      score: 1,
      stars: 3,
      passed: true,
      xp: 40,
    });
  });

  it('valide des exercices à partir d’une étoile', () => {
    expect(levelResult(level('resoudre-ax-b-c'), [...right(2), ...wrong(3)]).passed).toBe(false);
    expect(levelResult(level('resoudre-ax-b-c'), [...right(3), ...wrong(2)]).passed).toBe(true);
  });

  it('valide l’évaluation à 70 % ; 5 sur 8 donne 1 étoile et 20 XP (maquette X5b)', () => {
    const bilan = level('bilan');
    expect(levelResult(bilan, [...right(5), ...wrong(3)])).toMatchObject({
      stars: 1,
      passed: false,
      xp: 20,
    });
    expect(levelResult(bilan, [...right(6), ...wrong(2)]).passed).toBe(true);
  });

  it('garde le meilleur score quand on rejoue un niveau', () => {
    const first = mergeAttempt(undefined, 'x', { score: 0.8, stars: 2, passed: true, xp: 30 });
    const second = mergeAttempt(first, 'x', { score: 0.4, stars: 0, passed: false, xp: 10 });
    expect(second).toEqual({ levelId: 'x', finished: true, bestScore: 0.8, stars: 2, attempts: 2 });
  });
});

describe('déblocage sur le chemin', () => {
  it('ouvre d’abord le premier niveau jouable : les villes encore à écrire ne bloquent pas', () => {
    const path = islandPath(maths, new Map());
    const active = path.filter((p) => p.state === 'active');
    expect(active.map((p) => p.level.id)).toEqual(['maths-equations.qu-est-ce-qu-une-equation']);
    expect(path.filter((p) => !p.playable).every((p) => p.state === 'locked')).toBe(true);
  });

  it('avance le pion niveau par niveau et verrouille la suite', () => {
    const records = new Map([
      finished('qu-est-ce-qu-une-equation', 1),
      finished('tester-une-solution', 0.8),
    ]);
    const path = islandPath(maths, records).filter((p) => p.city.id === 'maths-equations');
    expect(path.map((p) => p.state)).toEqual([
      'completed',
      'completed',
      'active',
      'locked',
      'locked',
      'locked',
      'locked',
      'locked',
    ]);
  });

  it('garde des exercices sans étoile en cours : il faut les réussir pour avancer', () => {
    const records = new Map([
      finished('qu-est-ce-qu-une-equation', 1),
      finished('tester-une-solution', 0.3),
    ]);
    expect(
      isCleared(level('tester-une-solution'), records.get('maths-equations.tester-une-solution')),
    ).toBe(false);
    const active = islandPath(maths, records).find((p) => p.state === 'active');
    expect(active?.level.id).toBe('maths-equations.tester-une-solution');
  });

  it('ne reverrouille jamais un niveau terminé', () => {
    const records = new Map([finished('tester-une-solution', 0.9)]);
    const state = islandPath(maths, records).find(
      (p) => p.level.id === 'maths-equations.tester-une-solution',
    );
    expect(state?.state).toBe('completed');
  });
});

describe('statut et maîtrise d’une ville', () => {
  const allBefore = pathOf(maths)
    .filter((p) => p.city.id === 'maths-equations' && p.level.type !== 'evaluation')
    .map((p) => finished(p.level.id.split('.')[1]!, 0.8));

  it('est en cours tant que le bilan n’est pas tenté', () => {
    const records = new Map(allBefore);
    expect(cityStatus(equations, islandPath(maths, records), records)).toBe('current');
  });

  it('est validée à 70 % au bilan, à consolider en dessous', () => {
    const passed = new Map([...allBefore, finished('bilan', 0.75)]);
    const failed = new Map([...allBefore, finished('bilan', 0.63)]);
    expect(cityStatus(equations, islandPath(maths, passed), passed)).toBe('done');
    expect(cityStatus(equations, islandPath(maths, failed), failed)).toBe('consolidate');
  });

  it('calcule la maîtrise sur les exercices et le bilan, pas sur les leçons', () => {
    expect(cityMastery(equations, new Map())).toBeNull();
    const records = new Map([
      finished('isoler-x', 1),
      finished('resoudre-ax-b-c', 0.6),
      finished('bilan', 0.8),
    ]);
    expect(cityMastery(equations, records)).toBeCloseTo(0.7);
  });
});

describe('résumé d’une île (X1)', () => {
  it('compte les villes validées, les étoiles et la prochaine étape', () => {
    const records = new Map([
      finished('qu-est-ce-qu-une-equation', 1),
      finished('tester-une-solution', 0.75),
    ]);
    const summary = islandSummary(maths, records);
    expect(summary).toMatchObject({ citiesDone: 0, citiesTotal: 22, stars: 5, started: true });
    expect(summary.next?.level.title).toBe('Isoler x');
  });

  it('propose de commencer une île jamais jouée', () => {
    expect(islandSummary(islandOf('physique-chimie')!, new Map()).started).toBe(false);
  });
});
