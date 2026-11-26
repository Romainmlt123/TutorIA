import { MAX_RENDER_RATIO, passSizes } from './postSize';

describe('taille des passes d’effets', () => {
  it('garde la taille du tampon de dessin jusqu’à 2 pixels par dp (web)', () => {
    for (const ratio of [1, 1.5, MAX_RENDER_RATIO]) {
      expect(passSizes({ x: 780, y: 1688 }, ratio)).toEqual({
        scene: { width: 780, height: 1688 },
        half: { width: 390, height: 844 },
      });
    }
  });

  it('ramène un écran à 3 pixels par dp à 2 pixels par dp', () => {
    expect(passSizes({ x: 1170, y: 2532 }, 3)).toEqual({
      scene: { width: 780, height: 1688 },
      half: { width: 390, height: 844 },
    });
  });

  it('arrondit à l’entier inférieur une densité fractionnaire (Android)', () => {
    const { scene, half } = passSizes({ x: 1080, y: 2400 }, 2.625);
    expect(scene).toEqual({ width: 822, height: 1828 });
    expect(half).toEqual({ width: 411, height: 914 });
  });

  it('ne descend jamais sous un pixel', () => {
    expect(passSizes({ x: 1, y: 1 }, 3)).toEqual({
      scene: { width: 1, height: 1 },
      half: { width: 1, height: 1 },
    });
  });

  it('garde la pleine taille si la densité est inconnue', () => {
    for (const ratio of [0, -1, Number.NaN]) {
      expect(passSizes({ x: 400, y: 800 }, ratio).scene).toEqual({ width: 400, height: 800 });
    }
  });
});
