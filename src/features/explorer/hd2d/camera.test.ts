import { distanceToFit, orbit } from './camera';

describe('cadrage de la caméra', () => {
  it('place l’objet à la fraction demandée de la largeur, en portrait comme en paysage', () => {
    for (const aspect of [390 / 844, 16 / 9]) {
      const d = distanceToFit(7, 30, aspect, 0.8);
      const visible = 2 * d * Math.tan(Math.atan(Math.tan(Math.PI / 12) * aspect));
      expect(7 / visible).toBeCloseTo(0.8);
    }
  });

  it('tourne autour de la cible selon l’élévation et l’azimut', () => {
    const [x, y, z] = orbit([0, 0, 0], 10, 30);
    expect([x, y, z].map((v) => Math.round(v * 100) / 100)).toEqual([0, 5, 8.66]);
    expect(orbit([0, 0, 0], 10, 0, Math.PI / 2)[0]).toBeCloseTo(10);
  });
});
