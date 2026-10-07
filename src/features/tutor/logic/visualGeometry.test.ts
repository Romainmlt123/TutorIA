import { parseExpression } from './expression';
import {
  angleMark,
  figureScale,
  fitFigure,
  graphScale,
  niceTicks,
  pieSlices,
  sampleCurve,
} from './visualGeometry';

describe('géométrie des visuels', () => {
  it('gradue un repère avec des pas ronds', () => {
    expect(niceTicks(0, 30)).toEqual([0, 5, 10, 15, 20, 25, 30]);
    expect(niceTicks(-1, 7)).toEqual([0, 2, 4, 6]);
    expect(niceTicks(-3, 3, 6)).toEqual([-3, -2, -1, 0, 1, 2, 3]);
    expect(niceTicks(0, 0.5)).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5]);
    expect(niceTicks(5, 5)).toEqual([]);
  });

  it('place le repère à l’écran, l’axe des y vers le haut', () => {
    const scale = graphScale([0, 10], [0, 20], 200, 100);
    expect(scale.x(5)).toBe(100);
    expect(scale.y(0)).toBe(100);
    expect(scale.y(20)).toBe(0);
  });

  it('coupe une courbe là où elle n’existe pas', () => {
    const runs = sampleCurve(parseExpression('sqrt(x)')!, [-4, 4], [0, 3], 8);
    expect(runs).toHaveLength(1);
    expect(runs[0]![0]).toEqual({ x: 0, y: 0 });
    const hyperbola = sampleCurve(parseExpression('1/x')!, [-2, 2], [-5, 5], 40);
    expect(hyperbola.length).toBe(2);
  });

  it('partage un disque selon les effectifs', () => {
    const slices = pieSlices([1, 1, 2]);
    expect(slices.map((s) => s.share)).toEqual([0.25, 0.25, 0.5]);
    expect(slices[0]!.start).toBeCloseTo(-Math.PI / 2);
    expect(slices[2]!.end).toBeCloseTo((3 * Math.PI) / 2);
    expect(pieSlices([0, 0])).toEqual([]);
  });

  it('ramène une figure à l’écran sans la déformer', () => {
    const toScreen = fitFigure(
      [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 0, y: 3 },
      ],
      [],
      300,
      200,
      20,
    );
    const a = toScreen({ x: 0, y: 0 });
    const b = toScreen({ x: 4, y: 0 });
    const c = toScreen({ x: 0, y: 3 });
    expect(b.x - a.x).toBeCloseTo((a.y - c.y) * (4 / 3));
    expect(a.y).toBeGreaterThan(c.y);
    expect(figureScale(toScreen)).toBeCloseTo(160 / 3);
  });

  it('code un angle droit par un petit carré', () => {
    expect(angleMark({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }, 4, true)).toBe(
      'M4.0 0.0 L4.0 4.0 L0.0 4.0',
    );
  });
});
