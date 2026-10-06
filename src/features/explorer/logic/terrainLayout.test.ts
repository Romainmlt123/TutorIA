import { islandOf } from '../content';
import { buildRegionMap } from './regionMap';
import decorFile from '../stylized3d/regionDecor.json';
import {
  bladeAllowed,
  clearingDressing,
  decorPlan,
  grassTufts,
  landDiscs,
  landDistance,
  onLand,
  pathDistance,
  placedDecor,
  type DecorEntry,
} from './terrainLayout';

const maths = islandOf('maths')!;
const map = buildRegionMap(maths, 'maths-nombres', new Map())!;
const discs = landDiscs(map);
const distance = (a: { x: number; z: number }, b: { x: number; z: number }) =>
  Math.hypot(a.x - b.x, a.z - b.z);
const toPath = (p: { x: number; z: number }) => Math.min(...map.path.map((s) => distance(s, p)));

describe('terrain de la carte d’une région (X2b)', () => {
  it('couvre tous les points de niveau et les clairières, avec une marge de terre', () => {
    for (const node of map.nodes) expect(onLand(discs, node.x, node.z, 0.8)).toBe(true);
    for (const city of map.cities) {
      expect(onLand(discs, city.center.x, city.center.z, city.radius)).toBe(true);
    }
  });

  it('laisse du ciel entre les villes : l’île n’est pas un bloc', () => {
    // Le milieu des deux colonnes de villes, hors du chemin, n'est pas sur la terre.
    const gaps = [];
    for (let x = map.bounds.minX; x <= map.bounds.maxX; x += 0.5) {
      for (let z = map.bounds.minZ; z <= map.bounds.maxZ; z += 0.5) {
        if (landDistance(discs, x, z) > 0.3) gaps.push({ x, z });
      }
    }
    expect(gaps.length).toBeGreaterThan(0);
  });

  it('sème les mêmes décors pour une même région', () => {
    expect(decorPlan(map, 7)).toEqual(decorPlan(map, 7));
    expect(decorPlan(map, 7)).not.toEqual(decorPlan(map, 8));
  });

  it('garde le chemin, les points de niveau et les clairières dégagés', () => {
    const decor = decorPlan(map, 7);
    expect(decor.length).toBeGreaterThan(40);
    for (const d of decor) {
      expect(toPath(d)).toBeGreaterThan(0.5);
      expect(onLand(discs, d.x, d.z, 0.3)).toBe(true);
      // Une barrière longe le chemin juste hors du cercle des niveaux : 0,2 m de tolérance.
      for (const city of map.cities)
        expect(distance(city.center, d)).toBeGreaterThan(city.radius - 0.2);
    }
  });

  it('ne superpose pas deux décors', () => {
    const decor = decorPlan(map, 7);
    for (const [i, a] of decor.entries()) {
      for (const b of decor.slice(i + 1)) expect(distance(a, b)).toBeGreaterThan(0.2);
    }
  });

  it('aligne les barrières sur le chemin qu’elles longent', () => {
    const fences = decorPlan(map, 7).filter((d) => d.kind === 'barriere');
    expect(fences.length).toBeGreaterThan(0);
    for (const f of fences) {
      const d = toPath(f);
      expect(d).toBeGreaterThan(0.65);
      expect(d).toBeLessThan(1.2);
    }
  });

  it('sème l’herbe hors du chemin, des points de niveau et des monuments', () => {
    const tufts = grassTufts(map, decorPlan(map, 7), 3);
    expect(tufts.length).toBeGreaterThan(500);
    for (const t of tufts) {
      expect(toPath(t)).toBeGreaterThan(0.2);
      for (const city of map.cities) expect(distance(city.center, t)).toBeGreaterThan(0.75);
    }
  });

  it('mesure la distance au chemin comme un calcul direct, jusqu’à 1,5 m', () => {
    const near = pathDistance(map);
    for (const [x, z] of [
      [0, 0],
      [-5, 3],
      [2.5, -1],
      [-10, 8],
    ] as const) {
      const exact = toPath({ x, z });
      if (exact < 1.5) expect(near(x, z)).toBeCloseTo(exact, 6);
      else expect(near(x, z)).toBeGreaterThanOrEqual(1.5);
    }
  });

  it('écarte de la carte cuite les décors qui toucheraient le chemin ou un niveau', () => {
    const entries = (decorFile as unknown as Record<string, readonly DecorEntry[]>)[
      'maths-nombres'
    ]!;
    const node = map.nodes[0]!;
    const onPath = map.path[40]!;
    const tested: DecorEntry[] = [
      ...entries,
      ['cailloux', onPath.x, onPath.z, 0, 2],
      ['rocher-a', node.x, node.z, 0, 2],
      ['licorne', 30, 30, 0, 1],
    ];
    const kept = placedDecor(map, tested);
    expect(kept.length).toBeLessThan(tested.length);
    expect(kept.some((d) => d.kind === ('licorne' as never))).toBe(false);
    for (const d of kept) {
      expect(toPath(d)).toBeGreaterThan(0.5);
      for (const n of map.nodes) expect(distance(n, d)).toBeGreaterThan(n.radius);
    }
    // Blender évite déjà le chemin à peu près : seule une petite part de ses décors est retirée.
    expect(placedDecor(map, entries).length).toBeGreaterThan(entries.length * 0.8);
  });

  it('ne laisse pousser l’herbe ni sur le chemin, ni sous un niveau ou un monument', () => {
    const allowed = bladeAllowed(map);
    const onPath = map.path[60]!;
    expect(allowed(onPath.x, onPath.z)).toBe(false);
    expect(allowed(map.nodes[2]!.x, map.nodes[2]!.z)).toBe(false);
    expect(allowed(map.cities[0]!.center.x, map.cities[0]!.center.z)).toBe(false);
    // Loin de tout, entre deux villes, l'herbe pousse.
    const free = { x: map.bounds.maxX + 3, z: map.bounds.maxZ + 3 };
    expect(allowed(free.x, free.z)).toBe(true);
  });
});

describe('herbe et fleurs des clairières, autour des monuments', () => {
  const dressing = clearingDressing(map, 7);

  it('sème de l’herbe et quelques fleurs dans chaque clairière', () => {
    for (const city of map.cities) {
      const inside = (p: { x: number; z: number }) => distance(p, city.center) <= city.radius;
      expect(dressing.tufts.filter(inside).length).toBeGreaterThan(40);
      expect(dressing.decor.filter(inside).length).toBeGreaterThanOrEqual(3);
    }
  });

  it('laisse libres le monument, le chemin et les points de niveau', () => {
    for (const item of [...dressing.tufts, ...dressing.decor]) {
      expect(map.cities.every((c) => distance(item, c.center) > 0.95)).toBe(true);
      expect(toPath(item)).toBeGreaterThan(0.2);
      expect(map.nodes.every((n) => distance(item, n) > n.radius)).toBe(true);
    }
  });

  it('donne toujours le même semis pour une même graine', () => {
    expect(clearingDressing(map, 7)).toEqual(dressing);
  });
});
