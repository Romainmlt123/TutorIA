import { cityById, islandOf, levelById, pathOf } from '../content';
import {
  cityMastery,
  cityStatus,
  currentLevel,
  islandPath,
  isCityOpen,
  missingRequirements,
  islandSummary,
  isCleared,
  levelResult,
  mergeAttempt,
  regionSummary,
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

function finishedLevel(id: string, score: number, playedAt?: string): [string, LevelRecord] {
  return [
    id,
    mergeAttempt(undefined, id, { score, stars: starsFor(score), passed: true, xp: 0 }, playedAt),
  ];
}

function finished(slug: string, score: number, playedAt?: string): [string, LevelRecord] {
  return finishedLevel(`maths-equations.${slug}`, score, playedAt);
}

const city = (id: string) => cityById(id)!.city;

/** Tous les niveaux d'une ville, terminés avec ce score. */
function cityDone(id: string, score = 0.8): [string, LevelRecord][] {
  return city(id).levels.map((l) => finishedLevel(l.id, score));
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
  it('ouvre d’abord sept villes, celles sans prérequis, au premier niveau de chacune', () => {
    const active = islandPath(maths, new Map()).filter((p) => p.state === 'active');
    expect(active.map((p) => p.city.id)).toEqual([
      'maths-relatifs',
      'maths-puissances',
      'maths-statistiques',
      'maths-probabilites',
      'maths-triangles-quadrilateres',
      'maths-espace-solides',
      'maths-algorithmique',
    ]);
  });

  it('garde les Équations fermées tant que le Bilan du calcul littéral n’est pas tenté', () => {
    const records = new Map(cityDone('maths-relatifs'));
    expect(
      missingRequirements(maths, city('maths-calcul-litteral'), new Map()).map((c) => c.id),
    ).toEqual(['maths-relatifs']);
    expect(isCityOpen(maths, city('maths-calcul-litteral'), records)).toBe(true);
    expect(isCityOpen(maths, city('maths-equations'), records)).toBe(false);
    const withCalcul = new Map([...records, ...cityDone('maths-calcul-litteral', 0.4)]);
    expect(missingRequirements(maths, city('maths-equations'), withCalcul)).toEqual([]);
    expect(isCityOpen(maths, city('maths-equations'), withCalcul)).toBe(true);
  });

  it('ouvre une ville dès qu’un de ses niveaux a été joué, même sans ses prérequis', () => {
    const records = new Map([finished('qu-est-ce-qu-une-equation', 1)]);
    expect(isCityOpen(maths, city('maths-equations'), records)).toBe(true);
    expect(isCityOpen(maths, city('maths-thales'), records)).toBe(false);
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
    const active = islandPath(maths, records).find(
      (p) => p.state === 'active' && p.city.id === 'maths-equations',
    );
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
    expect(summary).toMatchObject({ citiesDone: 0, citiesTotal: 15, stars: 5, started: true });
    // Sans date de partie, le pion reste au premier niveau ouvert de l'île.
    expect(summary.next?.level.title).toBe('Additionner et soustraire des relatifs');
  });

  it('place le pion dans la ville jouée le plus récemment', () => {
    const records = new Map([
      finished('qu-est-ce-qu-une-equation', 1, '2026-09-28T10:00:00Z'),
      finished('tester-une-solution', 0.75, '2026-09-29T10:00:00Z'),
    ]);
    expect(islandSummary(maths, records).next?.level.title).toBe('Isoler x');
    const older = new Map([
      ...records,
      finishedLevel(
        'maths-statistiques.' + city('maths-statistiques').levels[0]!.id.split('.')[1],
        1,
        '2026-09-30T10:00:00Z',
      ),
    ]);
    expect(currentLevel(islandPath(maths, older), older)?.city.id).toBe('maths-statistiques');
  });

  it('propose de commencer une île jamais jouée', () => {
    expect(islandSummary(islandOf('physique-chimie')!, new Map()).started).toBe(false);
  });
});

describe('résumé d’une région (X2a)', () => {
  it('annonce une région à découvrir, puis en cours une fois visitée', () => {
    const fresh = regionSummary(maths, 'maths-espace', new Map());
    expect(fresh).toMatchObject({ citiesDone: 0, citiesTotal: 5, stars: 0, status: 'discover' });
    const seen = regionSummary(maths, 'maths-espace', new Map(), new Set(['maths-espace']));
    expect(seen.status).toBe('current');
  });

  it('compte les étoiles de la région et propose sa prochaine étape', () => {
    const records = new Map([
      finished('qu-est-ce-qu-une-equation', 1, '2026-09-28T10:00:00Z'),
      finished('tester-une-solution', 0.75, '2026-09-29T10:00:00Z'),
    ]);
    const nombres = regionSummary(maths, 'maths-nombres', records);
    expect(nombres).toMatchObject({ citiesDone: 0, citiesTotal: 6, stars: 5, status: 'current' });
    expect(nombres.next?.level.title).toBe('Isoler x');
    expect(regionSummary(maths, 'maths-donnees', records).status).toBe('discover');
  });

  it('marque une région à consolider, puis validée quand toutes ses villes le sont', () => {
    const algo = 'maths-algorithmique';
    const failed = new Map(
      cityDone(algo).map(([id, r]) =>
        id.endsWith('.bilan') ? [id, { ...r, bestScore: 0.4 }] : [id, r],
      ),
    );
    expect(regionSummary(maths, 'maths-algo', failed)).toMatchObject({
      status: 'consolidate',
      toConsolidate: 1,
    });
    const passed = new Map(cityDone(algo, 0.9));
    expect(regionSummary(maths, 'maths-algo', passed)).toMatchObject({
      status: 'done',
      citiesDone: 1,
      next: undefined,
    });
  });
});
