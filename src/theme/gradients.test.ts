import { angleToPoints } from './gradients';

describe('angleToPoints', () => {
  it('suit la convention CSS', () => {
    expect(angleToPoints(90)).toEqual({ start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } });
    expect(angleToPoints(180)).toEqual({ start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } });
  });

  it('oriente le dégradé 160° des cartes du haut-gauche vers le bas-droite', () => {
    const { start, end } = angleToPoints(160);
    expect(start.y).toBeLessThan(0.1);
    expect(end.y).toBeGreaterThan(0.9);
    expect(end.x).toBeGreaterThan(start.x);
  });
});
