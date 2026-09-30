import layout from '../stylized3d/regions.json';

/*
 * Géométrie des régions de l'île des Maths (X2a) : à quelle région appartient un point du plateau,
 * où poser le panneau de chaque région, et le masque que le shader peint sur l'herbe. Le tracé est
 * dans regions.json, en repère de l'app (x à droite, z vers la caméra).
 */

type Point = readonly [number, number];
type RegionLayout = { id: string; polygon: readonly Point[]; sign: Point };

const REGIONS: readonly RegionLayout[] = layout.regions.map((r) => ({
  id: r.id,
  polygon: r.polygon as unknown as Point[],
  sign: r.sign as unknown as Point,
}));

/** Les régions de la terre de l'île, dans l'ordre des canaux du masque (R, V, B). */
export const PLATEAU_REGIONS: readonly string[] = REGIONS.map((r) => r.id);

/** L'îlot flottant d'une région d'un seul chapitre (Algorithmique) : position, échelle, panneau. */
export const ISLET = {
  region: layout.islet.region,
  position: layout.islet.position as unknown as readonly [number, number, number],
  scale: layout.islet.scale,
  sign: layout.islet.sign as unknown as readonly [number, number, number],
};

function inside(polygon: readonly Point[], x: number, z: number): boolean {
  let result = false;
  polygon.forEach(([ax, az], i) => {
    const [bx, bz] = polygon[(i + 1) % polygon.length]!;
    if (az > z !== bz > z && x < ax + ((z - az) * (bx - ax)) / (bz - az)) result = !result;
  });
  return result;
}

/** Région du plateau en ce point, ou null hors de toute région. */
export function regionAt(x: number, z: number): string | null {
  return REGIONS.find((r) => inside(r.polygon, x, z))?.id ?? null;
}

/** Point du plateau où poser le panneau d'une région (repère de l'app). */
export function signOf(regionId: string): Point | null {
  return REGIONS.find((r) => r.id === regionId)?.sign ?? null;
}

/** Rayon moyen du plateau (mètres) : là où se pose le point de bord d'une région. */
const PLATEAU_RADIUS = 3.2;

/**
 * Point du bord de l'île dans la direction du panneau d'une région, vu du centre (repère de l'app) :
 * le panneau de la région se pose au-delà de ce point, hors de l'île.
 */
export function edgeOf(regionId: string): Point | null {
  const sign = signOf(regionId);
  if (!sign) return null;
  const length = Math.hypot(sign[0], sign[1]) || 1;
  return [(sign[0] / length) * PLATEAU_RADIUS, (sign[1] / length) * PLATEAU_RADIUS];
}

/** Côté, en mètres, de la zone du plateau couverte par le masque, centrée sur l'île. */
export const MASK_EXTENT = 8;
export const MASK_SIZE = 256;

/**
 * Masque RGBA des régions, vu de dessus : R, V et B valent 255 dans la région Nombres, Données ou
 * Espace ; A vaut 255 sur leurs frontières (un pixel d'épaisseur), pour les pointillés du shader.
 * Les lignes sont rangées de haut en bas, z croissant.
 */
export function regionMask(size = MASK_SIZE, extent = MASK_EXTENT): Uint8Array {
  const data = new Uint8Array(size * size * 4);
  const owner = new Int8Array(size * size).fill(-1);
  const coord = (i: number) => ((i + 0.5) / size) * extent - extent / 2;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const x = coord(col);
      const z = coord(row);
      owner[row * size + col] = REGIONS.findIndex((r) => inside(r.polygon, x, z));
    }
  }
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const at = row * size + col;
      const index = owner[at]!;
      const out = at * 4;
      if (index >= 0) data[out + index] = 255;
      const right = col + 1 < size ? owner[at + 1] : index;
      const below = row + 1 < size ? owner[at + size] : index;
      if (index !== right || index !== below) data[out + 3] = 255;
    }
  }
  return data;
}
