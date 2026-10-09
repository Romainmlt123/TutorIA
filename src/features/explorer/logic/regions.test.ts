import {
  focusOf,
  ISLET,
  MASK_EXTENT,
  MASK_SIZE,
  PLATEAU_REGIONS,
  regionAt,
  regionMask,
} from './regions';

/** Objets du décor de l'île (tools/explorer-3d/island_maths.py) et la région où ils doivent tomber. */
const PROPS: [string, number, number, string][] = [
  ['boulier', -2.55, 0.1, 'maths-nombres'],
  ['octaèdre', -2.6, 1.3, 'maths-nombres'],
  ['cubes 1-2-3', -1.9, 2.05, 'maths-nombres'],
  ['arbre +', -2.3, -0.95, 'maths-nombres'],
  ['pyramide orange', -0.25, 1.95, 'maths-nombres'],
  ['dé', 2.0, 1.95, 'maths-donnees'],
  ['pyramide violette', 2.05, 1.15, 'maths-donnees'],
  ['arbre ÷', 1.4, 2.3, 'maths-donnees'],
  ['grue', 0.55, -2.15, 'maths-espace'],
  ['rapporteur', -0.75, -2.25, 'maths-espace'],
  ['compas', 2.35, -0.05, 'maths-espace'],
  ['M', 1.65, -0.55, 'maths-espace'],
  ['arbre ×', 2.35, -1.1, 'maths-espace'],
  ['icosaèdre (dé à 20 faces)', 1.3, 0.2, 'maths-donnees'],
];

describe('régions du plateau de l’île des Maths', () => {
  it.each(PROPS)('met %s dans la bonne région', (_name, x, z, region) => {
    expect(regionAt(x, z)).toBe(region);
  });

  it('pose le point de visée de chaque région dans cette région', () => {
    for (const id of PLATEAU_REGIONS) {
      const [x, z] = focusOf(id)!;
      expect(regionAt(x, z)).toBe(id);
    }
  });

  it('couvre tout le plateau, sans trou ni recouvrement', () => {
    for (let x = -3.4; x <= 3.4; x += 0.2) {
      for (let z = -3.4; z <= 3.4; z += 0.2) {
        if (Math.hypot(x, z) < 3) expect(regionAt(x, z)).not.toBeNull();
      }
    }
    const mask = regionMask();
    for (let i = 0; i < mask.length; i += 4) {
      const owners = [mask[i], mask[i + 1], mask[i + 2]].filter((v) => v === 255).length;
      expect(owners).toBeLessThanOrEqual(1);
    }
  });

  it('peint dans le masque chaque région et ses frontières', () => {
    const mask = regionMask();
    const pixel = (x: number, z: number) => {
      const col = Math.floor(((x + MASK_EXTENT / 2) / MASK_EXTENT) * MASK_SIZE);
      const row = Math.floor(((z + MASK_EXTENT / 2) / MASK_EXTENT) * MASK_SIZE);
      return [...mask.subarray((row * MASK_SIZE + col) * 4, (row * MASK_SIZE + col) * 4 + 4)];
    };
    expect(pixel(-2.5, 0.5).slice(0, 3)).toEqual([255, 0, 0]);
    expect(pixel(2.5, 2.0).slice(0, 3)).toEqual([0, 255, 0]);
    expect(pixel(1.0, -2.0).slice(0, 3)).toEqual([0, 0, 255]);
    let borders = 0;
    for (let i = 3; i < mask.length; i += 4) if (mask[i] === 255) borders++;
    expect(borders).toBeGreaterThan(100);
  });

  it('partage l’aire du plateau à peu près comme les villes (6, 3 et 5)', () => {
    const area = new Map<string, number>();
    for (let x = -3.4; x <= 3.4; x += 0.05) {
      for (let z = -3.4; z <= 3.4; z += 0.05) {
        const id = Math.hypot(x, z) < 3.1 ? regionAt(x, z) : null;
        if (id) area.set(id, (area.get(id) ?? 0) + 1);
      }
    }
    const total = [...area.values()].reduce((a, b) => a + b, 0);
    expect(area.get('maths-nombres')! / total).toBeGreaterThan(0.3);
    expect(area.get('maths-donnees')! / total).toBeGreaterThan(0.15);
    expect(area.get('maths-espace')! / total).toBeGreaterThan(0.25);
  });

  it('vise l’îlot de l’Algorithmique, à l’écart du plateau', () => {
    const [x, z] = focusOf(ISLET.region)!;
    expect(Math.hypot(x, z)).toBeGreaterThan(4);
    expect(focusOf('maths-lune')).toBeNull();
  });
});
