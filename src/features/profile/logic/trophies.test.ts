import { NO_PROGRESS } from '@/features/avatar/logic/wardrobe';

import { TROPHIES, trophyShelf, type TrophyFacts } from './trophies';

const facts = (change: Partial<TrophyFacts> = {}): TrophyFacts => ({
  ...NO_PROGRESS,
  playerLevel: 1,
  regionsDone: new Set(),
  notions: 0,
  ...change,
});

describe('trophées du profil', () => {
  it('compte 24 trophées, chacun avec un identifiant unique', () => {
    expect(TROPHIES).toHaveLength(24);
    expect(new Set(TROPHIES.map((t) => t.id)).size).toBe(24);
  });

  it('montre les trophées gagnés, puis le prochain à gagner', () => {
    const shelf = trophyShelf(
      facts({ streak: 8, playerLevel: 7, levels: 3, stars: 18, cities: 1, notions: 2 }),
    );
    expect(shelf.earned.map((t) => t.id)).toEqual([
      'serie-3',
      'serie-7',
      'niveau-2',
      'niveau-5',
      'niveaux-1',
      'evaluation-1',
      'etoiles-10',
      'notions-1',
    ]);
    expect(shelf.next?.id).toBe('serie-14');
    expect(shelf.total).toBe(24);
  });

  it('gagne le trophée d’une région quand toutes ses villes sont validées', () => {
    const shelf = trophyShelf(facts({ regionsDone: new Set(['maths-nombres']) }));
    expect(shelf.earned.map((t) => t.id)).toEqual(['region-nombres']);
  });

  it('commence par le premier trophée de la liste, sans rien de gagné', () => {
    expect(trophyShelf(facts())).toMatchObject({ earned: [], next: { id: 'serie-3' } });
  });
});
