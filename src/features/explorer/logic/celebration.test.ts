import { CELEBRATION, planCelebration, starSlots } from './celebration';
import type { MapProgress } from './mapProgress';

const NOTHING: MapProgress = { stars: [], gaps: [], unlocked: [], cities: [] };

/** Un niveau terminé pour la première fois avec 3 étoiles, son tronçon, puis le niveau suivant. */
const LESSON_DONE: MapProgress = {
  stars: [{ levelId: 'lecon', from: 0, to: 3, firstTime: true }],
  gaps: [0],
  unlocked: ['exercices'],
  cities: [],
};

/** Le bilan d'une ville réussi : ses étoiles, la ville, un tronçon et deux villes qui s'ouvrent. */
const BILAN_PASSED: MapProgress = {
  stars: [{ levelId: 'bilan', from: 0, to: 2, firstTime: true }],
  gaps: [6],
  unlocked: ['fractions', 'litteral'],
  cities: [{ cityId: 'relatifs', from: 'current', to: 'done' }],
};

describe('ordre des étoiles qui apparaissent', () => {
  it('de gauche à droite, celle du milieu (la plus haute) en dernier', () => {
    expect(starSlots(0, 3)).toEqual([0, 2, 1]);
  });

  it('seulement les étoiles gagnées, et seulement les nouvelles', () => {
    expect(starSlots(0, 1)).toEqual([0]);
    expect(starSlots(0, 2)).toEqual([0, 1]);
    expect(starSlots(1, 3)).toEqual([2, 1]);
    expect(starSlots(2, 3)).toEqual([2]);
    expect(starSlots(2, 2)).toEqual([]);
  });
});

describe('déroulé de la célébration', () => {
  it('laisse l’écran se poser, montre la rangée, puis les étoiles une à une', () => {
    const plan = planCelebration(LESSON_DONE);
    const [stars] = plan.stars;
    expect(stars).toEqual({
      levelId: 'lecon',
      row: CELEBRATION.start,
      pops: [
        { slot: 0, at: CELEBRATION.start + CELEBRATION.row },
        { slot: 2, at: CELEBRATION.start + CELEBRATION.row + CELEBRATION.starStep },
        { slot: 1, at: CELEBRATION.start + CELEBRATION.row + 2 * CELEBRATION.starStep },
      ],
    });
  });

  it('enchaîne étoiles, ville, chemin, niveau ouvert, puis la marche de l’avatar', () => {
    const plan = planCelebration(BILAN_PASSED);
    const lastStar = Math.max(...plan.stars[0]!.pops.map((pop) => pop.at));
    const city = plan.cities[0]!;
    const gap = plan.gaps[0]!;
    const [first, second] = plan.unlocks;
    expect(city).toEqual({
      cityId: 'relatifs',
      from: 'current',
      to: 'done',
      at: expect.any(Number),
    });
    // Chaque étape attend la fin de la précédente.
    expect(city.at).toBeCloseTo(lastStar + CELEBRATION.starPop, 9);
    expect(gap.at).toBeCloseTo(city.at + CELEBRATION.cityFlip, 9);
    expect(first!.at).toBeCloseTo(gap.at + CELEBRATION.segmentReveal, 9);
    expect(second!.at).toBeCloseTo(first!.at + CELEBRATION.unlockStep, 9);
    expect(plan.walkAt).toBeCloseTo(second!.at + CELEBRATION.unlock, 9);
    // Les confettis tombent encore pendant que l'avatar marche.
    expect(plan.end).toBeCloseTo(Math.max(plan.walkAt, city.at + CELEBRATION.confetti), 9);
  });

  it('dévoile un long chemin tronçon après tronçon, en un temps borné', () => {
    const gaps = Array.from({ length: 8 }, (_, i) => i + 3);
    const plan = planCelebration({ ...NOTHING, gaps, unlocked: ['suivant'] });
    const times = plan.gaps.map((g) => g.at);
    expect(plan.gaps.map((g) => g.gap)).toEqual(gaps);
    expect(times[0]).toBe(CELEBRATION.start);
    // Un écart constant, plus court qu'à l'ordinaire, pour tenir dans la durée maximale.
    const step = times[1]! - times[0]!;
    expect(step).toBeCloseTo(CELEBRATION.pathMax / gaps.length, 9);
    expect(times[7]! - times[0]!).toBeLessThanOrEqual(CELEBRATION.pathMax);
  });

  it('rejouer pour une étoile de plus : ni rangée, ni chemin, l’avatar repart après l’étoile', () => {
    const plan = planCelebration({
      ...NOTHING,
      stars: [{ levelId: 'exercices', from: 1, to: 2, firstTime: false }],
    });
    expect(plan.stars).toEqual([
      { levelId: 'exercices', row: null, pops: [{ slot: 1, at: CELEBRATION.start }] },
    ]);
    expect(plan.walkAt).toBeCloseTo(CELEBRATION.start + CELEBRATION.starPop, 9);
    expect(plan.end).toBe(plan.walkAt);
  });

  it('une ville à consolider : un encouragement, sans confettis', () => {
    const plan = planCelebration({
      ...NOTHING,
      stars: [{ levelId: 'bilan', from: 0, to: 0, firstTime: true }],
      cities: [{ cityId: 'relatifs', from: 'current', to: 'consolidate' }],
    });
    // La rangée d'étoiles grises apparaît, sans étoile gagnée.
    expect(plan.stars[0]).toEqual({ levelId: 'bilan', row: CELEBRATION.start, pops: [] });
    const city = plan.cities[0]!;
    expect(city.at).toBeCloseTo(CELEBRATION.start + CELEBRATION.row, 9);
    expect(plan.end).toBeCloseTo(Math.max(plan.walkAt, city.at + CELEBRATION.cue), 9);
  });
});
