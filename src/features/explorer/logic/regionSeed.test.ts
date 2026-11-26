import { seedOf } from './regionSeed';

describe('graine des décors d’une région', () => {
  it('reste la même pour une région : la carte pré-rendue en dépend', () => {
    expect(seedOf('maths-nombres')).toBe(3061403585);
    expect(seedOf('maths-nombres')).toBe(seedOf('maths-nombres'));
  });

  it('change d’une région à l’autre, et reste un entier positif sur 32 bits', () => {
    const seeds = ['maths-nombres', 'maths-donnees', 'maths-espace', 'maths-algo'].map(seedOf);
    expect(new Set(seeds).size).toBe(seeds.length);
    for (const seed of seeds) {
      expect(Number.isInteger(seed)).toBe(true);
      expect(seed).toBeGreaterThanOrEqual(0);
      expect(seed).toBeLessThan(2 ** 32);
    }
  });
});
