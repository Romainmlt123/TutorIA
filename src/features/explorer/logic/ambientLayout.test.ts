import { TERRAIN_SCALES } from '../stylized3d/terrainScales';
import { piPoints, WATER_SURFACE } from '../stylized3d/waterLayout';
import { PRERENDERED_MAPS } from '../tiles';
import {
  CLOUD_AREA,
  GLINT_INSET,
  GLINT_MAX,
  GLINT_SPACING,
  mapClouds,
  scaledPi,
  waterGlints,
  type Glint,
} from './ambientLayout';
import { GLINT_GROUPS } from './mapAmbient';
import { imageV, type ImageFrame } from './mapProjection';
import { seedOf } from './regionSeed';

/** Carte pré-rendue de Nombres, dont le terrain est l'île agrandie 6 fois : l'échelle que lit l'écran. */
const NOMBRES = PRERENDERED_MAPS['maths-nombres']!;
const SCALE = TERRAIN_SCALES['maths-nombres']!;
const PI = piPoints().map(([x, z]) => [x * SCALE, z * SCALE] as const);
const SURFACE = WATER_SURFACE * SCALE;

/** Rectangle du rendu, en mètres du plan image. */
const rectOf = (frame: ImageFrame) => ({
  xMin: frame.x0,
  xMax: frame.x0 + frame.width / frame.ppm,
  vMin: frame.v0,
  vMax: frame.v0 + frame.height / frame.ppm,
});

/** Point dans le polygone (rayon horizontal), écrit à part de celui du module. */
function inside(polygon: readonly (readonly [number, number])[], x: number, z: number): boolean {
  let result = false;
  polygon.forEach(([ax, az], i) => {
    const [bx, bz] = polygon[(i + 1) % polygon.length]!;
    if (az > z !== bz > z && x < ax + ((z - az) * (bx - ax)) / (bz - az)) result = !result;
  });
  return result;
}

/** Distance d'un point au plus proche des bords du polygone. */
function edgeDistance(polygon: readonly (readonly [number, number])[], x: number, z: number) {
  return Math.min(
    ...polygon.map(([ax, az], i) => {
      const [bx, bz] = polygon[(i + 1) % polygon.length]!;
      const length = (bx - ax) ** 2 + (bz - az) ** 2;
      const h = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / length));
      return Math.hypot(x - ax - (bx - ax) * h, z - az - (bz - az) * h);
    }),
  );
}

describe.each(Object.keys(PRERENDERED_MAPS))('carte pré-rendue %s', (regionId) => {
  it('garde l’agrandissement de son terrain, même sans modèle 3D (TERRAIN_SCALES)', () => {
    expect(TERRAIN_SCALES[regionId]).toBeGreaterThan(0);
  });
});

describe('reflets sur l’eau du π d’une carte pré-rendue', () => {
  it('Nombres en a, par l’échelle de son terrain que l’écran donne à la carte', () => {
    expect(SCALE).toBe(6);
    // Comme RegionMapWorld : le π agrandi, et la graine de la région.
    const pi = scaledPi(SCALE);
    const placed = waterGlints(pi.outline, pi.surface, NOMBRES, seedOf(NOMBRES.regionId));
    expect(placed.length).toBeGreaterThan(10);
  });

  let glints: Glint[];
  beforeAll(() => {
    glints = waterGlints(PI, SURFACE, NOMBRES, 11);
  });

  it('en pose quelques dizaines au plus, répartis dans tous les groupes de scintillement', () => {
    expect(glints.length).toBeGreaterThan(10);
    expect(glints.length).toBeLessThanOrEqual(GLINT_MAX);
    expect(new Set(glints.map((g) => g.group))).toEqual(
      new Set(Array.from({ length: GLINT_GROUPS }, (_, i) => i)),
    );
  });

  it('les pose sur l’eau, loin des berges peintes', () => {
    for (const glint of glints) {
      expect(inside(PI, glint.x, glint.z)).toBe(true);
      expect(edgeDistance(PI, glint.x, glint.z)).toBeGreaterThanOrEqual(GLINT_INSET);
    }
  });

  it('les pose dans l’image rendue, à la hauteur de l’eau', () => {
    const rect = rectOf(NOMBRES);
    for (const glint of glints) {
      expect(glint.x).toBeGreaterThan(rect.xMin);
      expect(glint.x).toBeLessThan(rect.xMax);
      const v = imageV(glint.z, SURFACE);
      expect(v).toBeGreaterThan(rect.vMin);
      expect(v).toBeLessThan(rect.vMax);
    }
  });

  it('les espace, sans paquets', () => {
    glints.forEach((a, i) =>
      glints.slice(i + 1).forEach((b) => {
        expect(Math.hypot(a.x - b.x, a.z - b.z)).toBeGreaterThanOrEqual(GLINT_SPACING);
      }),
    );
  });

  it('couvre la barre du π et sa jambe gauche, qui traversent la carte de Nombres', () => {
    // Barre : z de −8,7 à −5,676 ; jambe gauche : x de −8,868 à −6,684, sous la barre.
    expect(glints.some((g) => g.z < -5.676)).toBe(true);
    expect(glints.some((g) => g.z > -5.676 && g.x > -8.868 && g.x < -6.684)).toBe(true);
  });

  it('les tire toujours au même endroit pour une même graine', () => {
    expect(waterGlints(PI, SURFACE, NOMBRES, 11)).toEqual(glints);
    expect(waterGlints(PI, SURFACE, NOMBRES, 12)).not.toEqual(glints);
  });

  it('n’en pose aucun quand l’eau est hors de l’image', () => {
    expect(waterGlints(PI, SURFACE, { ...NOMBRES, x0: 40 }, 11)).toEqual([]);
  });

  it('agrandit le π et la hauteur de son eau avec le terrain de la région', () => {
    expect(scaledPi(SCALE)).toEqual({ outline: PI, surface: SURFACE });
    expect(scaledPi(SCALE).outline[0]).toEqual([
      expect.closeTo(-11.91, 9),
      expect.closeTo(-8.7, 9),
    ]);
    expect(SURFACE).toBeCloseTo(0.132, 12);
  });
});

describe('nuages sous une carte pré-rendue', () => {
  const field = mapClouds(NOMBRES, 11);
  const rect = rectOf(NOMBRES);

  it('en pose un pour CLOUD_AREA m² d’image, comme la carte en 3D', () => {
    const area = (rect.xMax - rect.xMin) * (rect.vMax - rect.vMin);
    expect(field.clouds).toHaveLength(Math.round(area / CLOUD_AREA));
  });

  it('les répartit sur toute l’image', () => {
    for (const cloud of field.clouds) {
      expect(cloud.x).toBeGreaterThanOrEqual(rect.xMin);
      expect(cloud.x).toBeLessThanOrEqual(rect.xMax);
      expect(cloud.v).toBeGreaterThanOrEqual(rect.vMin);
      expect(cloud.v).toBeLessThanOrEqual(rect.vMax);
    }
    // Chaque quart de l'image (gauche, droite, haut, bas) en a au moins un.
    const midX = (rect.xMin + rect.xMax) / 2;
    const midV = (rect.vMin + rect.vMax) / 2;
    expect(field.clouds.some((c) => c.x < midX)).toBe(true);
    expect(field.clouds.some((c) => c.x > midX)).toBe(true);
    expect(field.clouds.some((c) => c.v < midV)).toBe(true);
    expect(field.clouds.some((c) => c.v > midV)).toBe(true);
  });

  it('les fait dériver lentement, chacun à sa vitesse', () => {
    const speeds = field.clouds.map((c) => c.speed);
    expect(Math.min(...speeds)).toBeGreaterThanOrEqual(0.05);
    expect(Math.max(...speeds)).toBeLessThanOrEqual(0.15);
    expect(new Set(speeds).size).toBeGreaterThan(1);
  });

  it('les fait revenir à gauche une fois sortis de l’image, jamais sous les yeux de l’élève', () => {
    const [min, max] = field.wrap;
    for (const cloud of field.clouds) {
      expect(min + cloud.halfWidth).toBeLessThanOrEqual(rect.xMin);
      expect(max - cloud.halfWidth).toBeGreaterThanOrEqual(rect.xMax);
    }
  });

  it('dessine chaque nuage en bouffées : le dessous bleuté, puis le dessus éclairé', () => {
    for (const cloud of field.clouds) {
      const tones = cloud.puffs.map((p) => p.tone);
      expect(tones.indexOf('lit')).toBe(tones.lastIndexOf('shade') + 1);
      expect(tones.filter((t) => t === 'shade')).toHaveLength(tones.length / 2);
      for (const puff of cloud.puffs) {
        // Le bord doux de chaque bouffée tient dans la vue du nuage.
        const reach = puff.spread + puff.blur;
        expect(Math.abs(puff.dx) + puff.width / 2 + reach).toBeLessThanOrEqual(
          cloud.halfWidth + 1e-9,
        );
        expect(Math.abs(puff.dv) + puff.height / 2 + reach).toBeLessThanOrEqual(
          cloud.halfHeight + 1e-9,
        );
      }
    }
  });

  it('les tire toujours au même endroit pour une même graine', () => {
    expect(mapClouds(NOMBRES, 11)).toEqual(field);
  });
});
