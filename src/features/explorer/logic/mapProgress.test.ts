import { fr } from '@/i18n/fr';

import { islandOf } from '../content';
import { progressMessage, progressSince } from './mapProgress';
import type { LevelRecord, Stars } from './progression';
import { buildRegionMap, type RegionMap } from './regionMap';

const island = islandOf('maths')!;

/** Carte de Nombres pour ces résultats : niveau → [meilleur score, étoiles]. */
function mapWith(results: Record<string, readonly [number, Stars]> = {}): RegionMap {
  const records = Object.entries(results).map(([levelId, [bestScore, stars]]): LevelRecord => ({
    levelId,
    finished: true,
    bestScore,
    stars,
    attempts: 1,
  }));
  return buildRegionMap(island, 'maths-nombres', new Map(records.map((r) => [r.levelId, r])))!;
}

/** Les sept niveaux des Relatifs, dans l'ordre du chemin (le dernier est le bilan de la ville). */
const RELATIFS = mapWith().nodes.slice(0, 7);
const [lesson, exercises, , , , , bilan] = RELATIFS.map((node) => node.levelId) as [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];
/** Les six premiers niveaux des Relatifs terminés : il ne reste que le bilan. */
const BEFORE_BILAN = Object.fromEntries(
  RELATIFS.slice(0, 6).map((node) => [node.levelId, [1, 3] as const]),
);
/** Premiers niveaux des deux villes qui attendent le bilan des Relatifs. */
const FIRST_FRACTION = mapWith().nodes[7]!;
const FIRST_LITTERAL = mapWith().nodes.find((node) => node.cityId === 'maths-calcul-litteral')!;

describe('ce qui a changé sur la carte depuis la dernière visite', () => {
  it('ne célèbre rien à la première visite de la région', () => {
    expect(progressSince(undefined, mapWith({ [lesson]: [1, 3] }))).toBeNull();
  });

  it('ne célèbre rien quand rien n’a changé (carte recalculée à l’identique)', () => {
    expect(progressSince(mapWith({ [lesson]: [1, 3] }), mapWith({ [lesson]: [1, 3] }))).toBeNull();
  });

  it('ne compare pas deux régions différentes', () => {
    const other = { ...mapWith({ [lesson]: [1, 3] }), regionId: 'maths-geometrie' };
    expect(progressSince(mapWith(), other)).toBeNull();
  });

  it('première leçon terminée : ses étoiles, le tronçon du chemin, puis le niveau suivant', () => {
    expect(progressSince(mapWith(), mapWith({ [lesson]: [1, 3] }))).toEqual({
      stars: [{ levelId: lesson, from: 0, to: 3, firstTime: true }],
      gaps: [0],
      unlocked: [exercises],
      cities: [],
    });
  });

  it('exercices rejoués : seules les étoiles nouvelles, sans chemin ni niveau ouvert', () => {
    const before = mapWith({ [lesson]: [1, 3], [exercises]: [0.6, 1] });
    const after = mapWith({ [lesson]: [1, 3], [exercises]: [0.8, 2] });
    expect(progressSince(before, after)).toEqual({
      stars: [{ levelId: exercises, from: 1, to: 2, firstTime: false }],
      gaps: [],
      unlocked: [],
      cities: [],
    });
  });

  it('exercices terminés sans étoile : rien à célébrer (le niveau reste à jouer)', () => {
    const before = mapWith({ [lesson]: [1, 3] });
    expect(progressSince(before, mapWith({ [lesson]: [1, 3], [exercises]: [0.3, 0] }))).toBeNull();
  });

  it('bilan réussi : la ville est validée et les villes qui l’attendaient s’ouvrent', () => {
    const before = mapWith(BEFORE_BILAN);
    const after = mapWith({ ...BEFORE_BILAN, [bilan]: [0.8, 2] });
    expect(progressSince(before, after)).toEqual({
      stars: [{ levelId: bilan, from: 0, to: 2, firstTime: true }],
      gaps: [6],
      unlocked: [FIRST_FRACTION.levelId, FIRST_LITTERAL.levelId],
      cities: [{ cityId: 'maths-relatifs', from: 'current', to: 'done' }],
    });
  });

  it('bilan sous 70 % : la ville est à consolider, et la suite s’ouvre quand même', () => {
    const before = mapWith(BEFORE_BILAN);
    const after = mapWith({ ...BEFORE_BILAN, [bilan]: [0.5, 1] });
    expect(progressSince(before, after)).toMatchObject({
      stars: [{ levelId: bilan, from: 0, to: 1, firstTime: true }],
      unlocked: [FIRST_FRACTION.levelId, FIRST_LITTERAL.levelId],
      cities: [{ cityId: 'maths-relatifs', from: 'current', to: 'consolidate' }],
    });
  });

  it('bilan retenté et réussi : la ville passe de « à consolider » à validée', () => {
    const before = mapWith({ ...BEFORE_BILAN, [bilan]: [0.5, 1] });
    const after = mapWith({ ...BEFORE_BILAN, [bilan]: [0.9, 3] });
    expect(progressSince(before, after)).toEqual({
      stars: [{ levelId: bilan, from: 1, to: 3, firstTime: false }],
      gaps: [],
      unlocked: [],
      cities: [{ cityId: 'maths-relatifs', from: 'consolidate', to: 'done' }],
    });
  });

  it('bilan retenté sans dépasser 70 % : l’état de la ville ne change pas, rien à célébrer', () => {
    const before = mapWith({ ...BEFORE_BILAN, [bilan]: [0.5, 1] });
    expect(progressSince(before, mapWith({ ...BEFORE_BILAN, [bilan]: [0.55, 1] }))).toBeNull();
  });
});

describe('annonce du lecteur d’écran', () => {
  it('dit les étoiles gagnées, la ville validée puis le niveau ouvert, dans l’ordre de la carte', () => {
    const before = mapWith(BEFORE_BILAN);
    const after = mapWith({ ...BEFORE_BILAN, [bilan]: [0.8, 2] });
    const node = after.nodes[6]!;
    const city = after.cities.find((c) => c.id === 'maths-relatifs')!;
    const T = fr.explorer.celebration;
    expect(progressMessage(progressSince(before, after)!, after)).toBe(
      [
        T.stars(2, fr.explorer.levelTypes[node.type], node.title),
        T.cityDone(city.name),
        T.unlocked(fr.explorer.levelTypes[FIRST_FRACTION.type], FIRST_FRACTION.title),
        T.unlocked(fr.explorer.levelTypes[FIRST_LITTERAL.type], FIRST_LITTERAL.title),
      ].join(' '),
    );
  });

  it('encourage sans parler d’échec quand la ville est à consolider', () => {
    const before = mapWith(BEFORE_BILAN);
    const after = mapWith({ ...BEFORE_BILAN, [bilan]: [0.4, 0] });
    const message = progressMessage(progressSince(before, after)!, after);
    expect(message).toContain(fr.explorer.celebration.cityConsolidate(after.cities[0]!.name));
    expect(message).not.toMatch(/échec|raté|perdu/i);
    // Aucune étoile gagnée : rien n'en est dit.
    expect(message).not.toContain('étoile');
  });
});
