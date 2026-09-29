import { theme } from '@/theme';

import { drawMathsIsland } from './islandMaths';

describe('île des Maths illustrée', () => {
  const shapes = drawMathsIsland();

  it('produit des tracés valides, triés du fond vers l’avant', () => {
    expect(shapes.length).toBeGreaterThan(100);
    expect(shapes.every((s) => !s.d.includes('NaN'))).toBe(true);
    expect(shapes.every((s, i) => i === 0 || shapes[i - 1]!.depth <= s.depth)).toBe(true);
  });

  it('n’utilise aucun rouge de la palette (réservé aux évaluations)', () => {
    const reds = new Set(Object.values(theme.palette.red).map((c) => c.toLowerCase()));
    expect(shapes.filter((s) => reds.has(s.fill.toLowerCase()))).toEqual([]);
  });
});
