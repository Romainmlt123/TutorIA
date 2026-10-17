import { PRERENDERED_MAPS } from '../tiles';
import {
  boundsInside,
  CAMERA_MARGIN,
  clampScroll,
  dpPerMeter,
  imageScale,
  imageScrollBounds,
  imageV,
  MAP_AIM_ROW,
  nodeScrollBounds,
  renderedRectOf,
  scrollToContentTranslation,
  snapToPixel,
  TALLEST_SCREEN,
  tiledScrollBounds,
  tileRect,
  tilesInView,
  worldToContentDp,
  worldToImagePx,
  type ImageFrame,
} from './mapProjection';
import { MAP_VISIBLE_WIDTH } from './shots';

const SIN = Math.sin((52 * Math.PI) / 180);
const COS = Math.cos((52 * Math.PI) / 180);

/** Zone serrée du rendu de vérification dans Blender (ville des Relatifs). */
const BLENDER_ZONE: ImageFrame = {
  ppm: 224,
  x0: -14.950892857142858,
  v0: -2.2740535714285715,
  width: 1546,
  height: 1546,
};

/** Image de calcul à la main : 8 m sur 10 m, à 100 px/m, dont le coin haut gauche est en (-2, -1). */
const FRAME: ImageFrame = { ppm: 100, x0: -2, v0: -1, width: 800, height: 1000 };

describe('carte pré-rendue : du monde au plan image', () => {
  it('projette sur le plan image de la caméra à 52° : z raccourci, la hauteur remonte', () => {
    expect(imageV(1, 0)).toBeCloseTo(SIN, 12);
    expect(imageV(0, 1)).toBeCloseTo(-COS, 12);
    expect(imageV(2, 0.5)).toBeCloseTo(2 * SIN - 0.5 * COS, 12);
  });

  it('tombe sur le pixel mesuré dans le rendu de Blender', () => {
    const at = worldToImagePx(BLENDER_ZONE, -11.5, 1.5, 0);
    expect(at.x).toBeCloseTo(773.0, 3);
    expect(at.y).toBeCloseTo(774.16, 2);
  });

  it('place le coin haut gauche du rendu au pixel (0, 0)', () => {
    expect(worldToImagePx(FRAME, -2, -1 / SIN)).toEqual({ x: 0, y: expect.closeTo(0, 9) });
    // Un point en hauteur remonte dans l'image : y diminue de cos 52° par mètre.
    expect(worldToImagePx(FRAME, 0, 0, 1)).toEqual({
      x: 200,
      y: expect.closeTo((1 - COS) * 100, 9),
    });
  });
});

describe('carte pré-rendue : du plan image aux dp', () => {
  it('montre 4 m de carte sur la largeur de l’écran', () => {
    expect(dpPerMeter(390)).toBe(97.5);
    expect(dpPerMeter(400) * MAP_VISIBLE_WIDTH).toBe(400);
  });

  it('donne la taille d’un pixel du rendu en dp, pour poser les tuiles', () => {
    expect(imageScale({ ppm: 224 }, dpPerMeter(390))).toBeCloseTo(97.5 / 224, 12);
    // Une tuile de 512 px couvre 512/224 m de carte.
    expect(512 * imageScale({ ppm: 224 }, 97.5)).toBeCloseTo((512 / 224) * 97.5, 9);
  });

  it('place un point du monde dans le contenu, dont l’origine est le pixel (0, 0)', () => {
    expect(worldToContentDp(FRAME, 100, 1, 0, 0)).toEqual({ x: 300, y: 100 });
    expect(worldToContentDp(FRAME, 100, 0, 0, 1)).toEqual({
      x: 200,
      y: expect.closeTo((1 - COS) * 100, 9),
    });
  });

  it('suit les pixels du rendu : dp = pixels × échelle de l’image', () => {
    const k = dpPerMeter(412);
    const px = worldToImagePx(BLENDER_ZONE, -11.5, 1.5, 0.3);
    const dp = worldToContentDp(BLENDER_ZONE, k, -11.5, 1.5, 0.3);
    expect(dp.x).toBeCloseTo(px.x * imageScale(BLENDER_ZONE, k), 9);
    expect(dp.y).toBeCloseTo(px.y * imageScale(BLENDER_ZONE, k), 9);
  });
});

describe('carte pré-rendue : défilement', () => {
  const screen = { width: 390, height: 844 };
  const k = dpPerMeter(screen.width);

  it('déplace le contenu pour que le point suivi soit au centre, à 45 % de la hauteur', () => {
    expect(MAP_AIM_ROW).toBe(0.45);
    const at = scrollToContentTranslation(0, 0, screen, FRAME, k);
    expect(at.translateX).toBeCloseTo(195 - 2 * 97.5, 9);
    expect(at.translateY).toBeCloseTo(0.45 * 844 - 97.5, 9);
  });

  it('pose le sol suivi sur le point de visée, où qu’il soit', () => {
    for (const [x, z] of [
      [-11.5, 1.5],
      [3, -2],
      [0.25, 7.75],
    ] as const) {
      const shift = scrollToContentTranslation(x, z, screen, BLENDER_ZONE, k);
      const point = worldToContentDp(BLENDER_ZONE, k, x, z, 0);
      expect(point.x + shift.translateX).toBeCloseTo(screen.width / 2, 9);
      expect(point.y + shift.translateY).toBeCloseTo(0.45 * screen.height, 9);
    }
  });
});

describe('carte pré-rendue : bornes du défilement', () => {
  it('borne la caméra aux points de niveau, avec sa marge', () => {
    const nodes = [
      { x: 1, z: 2 },
      { x: -3, z: 5 },
      { x: 0, z: 3 },
    ];
    expect(CAMERA_MARGIN).toBe(0.6);
    expect(nodeScrollBounds(nodes)).toEqual({
      minX: -3.6,
      maxX: 1.6,
      minZ: expect.closeTo(1.4, 12),
      maxZ: 5.6,
    });
  });

  it('garde l’écran dans l’image rendue', () => {
    // Écran de 4 m sur 8 m de plan image.
    const bounds = imageScrollBounds(FRAME, { width: 400, height: 800 }, 100);
    expect(bounds.minX).toBeCloseTo(0, 12);
    expect(bounds.maxX).toBeCloseTo(4, 12);
    expect(bounds.minZ).toBeCloseTo((-1 + 0.45 * 8) / SIN, 12);
    expect(bounds.maxZ).toBeCloseTo((-1 + 10 - 0.55 * 8) / SIN, 12);
  });

  it('pose les bords de l’écran pile sur ceux de l’image, aux bornes', () => {
    const screen = { width: 412, height: 915 };
    const k = dpPerMeter(screen.width);
    const frame: ImageFrame = { ...BLENDER_ZONE, width: 4132, height: 4868 };
    const bounds = imageScrollBounds(frame, screen, k);
    const size = imageScale(frame, k);
    const topLeft = scrollToContentTranslation(bounds.minX, bounds.minZ, screen, frame, k);
    expect(topLeft.translateX).toBeCloseTo(0, 9);
    expect(topLeft.translateY).toBeCloseTo(0, 9);
    const bottomRight = scrollToContentTranslation(bounds.maxX, bounds.maxZ, screen, frame, k);
    expect(bottomRight.translateX + frame.width * size).toBeCloseTo(screen.width, 9);
    expect(bottomRight.translateY + frame.height * size).toBeCloseTo(screen.height, 9);
  });

  it('centre une image plus petite que l’écran au lieu d’inverser ses bornes', () => {
    const narrow: ImageFrame = { ...FRAME, width: 300 };
    const bounds = imageScrollBounds(narrow, { width: 400, height: 800 }, 100);
    expect(bounds.minX).toBeCloseTo(-0.5, 12);
    expect(bounds.maxX).toBeCloseTo(-0.5, 12);
  });

  it('arrête le point suivi au bord de l’image, élastique compris', () => {
    const bounds = { minX: 0, maxX: 4, minZ: 3, maxZ: 6 };
    expect(clampScroll(2, 4, bounds)).toEqual({ x: 2, z: 4 });
    expect(clampScroll(-1, 7, bounds)).toEqual({ x: 0, z: 6 });
    expect(clampScroll(5, 2, bounds)).toEqual({ x: 4, z: 3 });
  });

  it('ramène les bornes des niveaux dans celles de l’image', () => {
    const image = { minX: 0, maxX: 4, minZ: 3, maxZ: 6 };
    expect(boundsInside({ minX: -1, maxX: 2, minZ: 4, maxZ: 9 }, image)).toEqual({
      minX: 0,
      maxX: 2,
      minZ: 4,
      maxZ: 6,
    });
    // Des niveaux tout entiers hors de l'image : la caméra reste au bord le plus proche.
    expect(boundsInside({ minX: 5, maxX: 7, minZ: 1, maxZ: 2 }, image)).toEqual({
      minX: 4,
      maxX: 4,
      minZ: 3,
      maxZ: 3,
    });
  });

  it('rend tout ce que la caméra peut montrer depuis les bornes des niveaux, jusqu’à un écran de 20:9', () => {
    expect(TALLEST_SCREEN).toBeGreaterThan(20 / 9);
    const nodes = [
      { x: -11.5, z: 1.5 },
      { x: -4.5, z: -3.5 },
      { x: -15, z: 7 },
    ];
    const [minX, maxX, minV, maxV] = renderedRectOf(nodes);
    const frame: ImageFrame = {
      ppm: 224,
      x0: minX,
      v0: minV,
      width: (maxX - minX) * 224,
      height: (maxV - minV) * 224,
    };
    const nodeBounds = nodeScrollBounds(nodes);
    for (const ratio of [16 / 9, 20 / 9, TALLEST_SCREEN]) {
      const screen = { width: 390, height: 390 * ratio };
      const image = imageScrollBounds(frame, screen, dpPerMeter(screen.width));
      expect(image.minX).toBeLessThanOrEqual(nodeBounds.minX + 1e-9);
      expect(image.maxX).toBeGreaterThanOrEqual(nodeBounds.maxX - 1e-9);
      expect(image.minZ).toBeLessThanOrEqual(nodeBounds.minZ + 1e-9);
      expect(image.maxZ).toBeGreaterThanOrEqual(nodeBounds.maxZ - 1e-9);
    }
  });
});

describe('carte pré-rendue : bornes d’une carte en tuiles', () => {
  it('borne la caméra aux niveaux avec leur marge, sans jamais montrer l’au-delà de l’image', () => {
    const screen = { width: 400, height: 800 };
    const nodes = [
      { x: 0.5, z: 5 },
      { x: 3, z: 6 },
    ];
    // Image de 8 m sur 10 m (FRAME), écran de 4 m sur 8 m : l'image arrête la caméra à gauche
    // (x = 0) et vers le bas, les niveaux à droite et vers le haut.
    const bounds = tiledScrollBounds(nodes, FRAME, screen, 100);
    expect(bounds.minX).toBe(0);
    expect(bounds.maxX).toBeCloseTo(3 + CAMERA_MARGIN, 12);
    expect(bounds.minZ).toBeCloseTo(5 - CAMERA_MARGIN, 12);
    expect(bounds.maxZ).toBeCloseTo((-1 + 10 - 0.55 * 8) / SIN, 12);
  });
});

describe('carte pré-rendue : tuiles', () => {
  it('pose une tuile à sa place du rendu, à l’échelle de l’image', () => {
    expect(tileRect({ x: 511, y: 1023, width: 514, height: 513 }, 0.5)).toEqual({
      left: 255.5,
      top: 511.5,
      width: 257,
      height: 256.5,
    });
  });

  it.each(Object.entries(PRERENDERED_MAPS))(
    'pose les tuiles de %s bord à bord : deux voisines se recouvrent de leurs marges, sans joint',
    (_regionId, map) => {
      const { tile, bleed, width, height, tiles } = map!;
      const at = new Map(tiles.map((t) => [`${t.col}-${t.row}`, t]));
      for (const t of tiles) {
        // Le contenu de la tuile commence `bleed` pixels avant sa case de la grille (sauf au bord).
        expect(t.x).toBe(Math.max(t.col * tile - bleed, 0));
        expect(t.y).toBe(Math.max(t.row * tile - bleed, 0));
        expect(t.x + t.width).toBe(Math.min((t.col + 1) * tile + bleed, width));
        expect(t.y + t.height).toBe(Math.min((t.row + 1) * tile + bleed, height));
        const right = at.get(`${t.col + 1}-${t.row}`);
        if (right) expect(t.x + t.width - right.x).toBe(2 * bleed);
        const below = at.get(`${t.col}-${t.row + 1}`);
        if (below) expect(t.y + t.height - below.y).toBe(2 * bleed);
      }
    },
  );

  it('retient les tuiles qui touchent l’écran, le contenu étant déplacé', () => {
    // Grille de 3 × 2 tuiles de 100 px (sans marge), à 1 dp par pixel ; écran de 150 × 120 dp.
    const rects = [0, 1, 2].flatMap((col) =>
      [0, 1].map((row) => ({ x: col * 100, y: row * 100, width: 100, height: 100 })),
    );
    const screen = { width: 150, height: 120 };
    const inView = (translateX: number, translateY: number) =>
      tilesInView(rects, 1, { translateX, translateY }, screen).map(
        (i) => `${rects[i]!.x / 100}-${rects[i]!.y / 100}`,
      );
    expect(inView(0, 0)).toEqual(['0-0', '0-1', '1-0', '1-1']);
    expect(inView(-160, 0)).toEqual(['1-0', '1-1', '2-0', '2-1']);
    // Une tuile qui affleure le bord de l'écran ne compte pas.
    expect(inView(-100, -100)).toEqual(['1-1', '2-1']);
    expect(inView(-400, 0)).toEqual([]);
  });
});

describe('carte pré-rendue : affichage', () => {
  it('arrondit au pixel physique le plus proche', () => {
    expect(snapToPixel(10.2, 3)).toBeCloseTo(10 + 1 / 3, 12);
    expect(snapToPixel(-7.49, 2)).toBe(-7.5);
    expect(snapToPixel(4.4, 1)).toBe(4);
  });
});
