import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { mapArt } from '@/theme/mapArt';

import type { DiscTouch } from '../../hooks/useDiscTouch';
import type { MapCelebration } from '../../hooks/useMapCelebration';
import { useMapClock } from '../../hooks/useMapClock';
import { CELEBRATION, planCelebration } from '../../logic/celebration';
import type { MapProgress } from '../../logic/mapProgress';
import type { MapNode, RegionMap } from '../../logic/regionMap';
import { nodeSprites, type MapTiles as MapTilesData } from '../../tiles';
import { RegionMapWorld } from './RegionMapWorld';

// La doublure de Reanimated n'a pas d'horloge d'image : l'horloge de la carte reste à zéro.
jest.mock('../../hooks/useMapClock', () => ({ useMapClock: jest.fn(() => ({ value: 0 })) }));
jest.mock('../../hooks/mapScrollValue', () => ({
  MAP_SCROLL_X: { value: 0 },
  MAP_SCROLL_Z: { value: 0 },
}));

/** Une tuile, et trois tronçons du chemin (entre les niveaux 0-1, 1-2 et 2-3). */
const TILES: MapTilesData = {
  version: 1,
  regionId: 'essai',
  ppm: 100,
  elevation: 52,
  x0: -2,
  v0: -1,
  width: 400,
  height: 400,
  tile: 400,
  bleed: 1,
  layoutHash: 'essai',
  underlay: { factor: 4, source: 9 },
  tiles: [{ col: 0, row: 0, x: 0, y: 0, width: 400, height: 400, source: 1 }],
  doneSegments: [0, 1, 2].map((gap) => ({
    gap,
    x: gap * 10,
    y: 0,
    width: 10,
    height: 10,
    source: 100 + gap,
  })),
};

const node = (
  levelId: string,
  type: MapNode['type'],
  state: MapNode['state'],
  x: number,
  z: number,
) =>
  ({
    levelId,
    cityId: 'ville',
    type,
    title: levelId,
    state,
    stars: 0,
    x,
    z,
    radius: type === 'evaluation' ? 0.255 : 0.195,
  }) satisfies MapNode;

/** Un niveau terminé, celui du pion (à jouer), puis deux fermés ; le pion est le plus au fond. */
const MAP: RegionMap = {
  regionId: 'essai',
  nodes: [
    node('a', 'lecon', 'completed', 1, 0),
    node('b', 'exercices', 'active', 0, -1),
    node('c', 'lecon', 'locked', -1, 0.5),
    node('d', 'evaluation', 'locked', 0, 1),
  ],
  cities: [],
  path: [],
  bounds: { minX: -1, maxX: 1, minZ: -1, maxZ: 1 },
  pawnIndex: 1,
};

/** Valeur partagée figée (la doublure de Reanimated calcule chaque style une fois, au rendu). */
const fixed = <T,>(value: T) => ({ value, get: () => value }) as unknown as SharedValue<T>;
/** Aucun niveau touché. */
const NO_TOUCH: DiscTouch = { index: fixed(-1), progress: fixed(1) };

/** Carte rendue sur un écran de 400 dp : 100 dp par mètre de carte. */
async function mount(
  ambient = true,
  terrainScale?: number,
  extra: { map?: RegionMap; celebration?: MapCelebration; touch?: DiscTouch } = {},
) {
  const { container } = await render(
    <RegionMapWorld
      tiles={TILES}
      screen={{ width: 400, height: 800 }}
      map={extra.map ?? MAP}
      start={{ x: 0, z: 0 }}
      terrainScale={terrainScale}
      ambient={ambient}
      celebration={extra.celebration ?? null}
      touch={extra.touch ?? NO_TOUCH}
      onReady={jest.fn()}
    />,
  );
  return container;
}

async function world(ambient = true) {
  const container = await mount(ambient);
  return container.queryAll((n) => n.type === 'Image').map((image) => image.props);
}

/** Couleurs des bouffées des nuages et des reflets. */
const AMBIENT_COLORS: readonly (string | undefined)[] = [
  mapArt.cloud.lit,
  mapArt.cloud.shade,
  mapArt.glint,
];

const colorOf = (node: { props: { style?: unknown } }) =>
  (StyleSheet.flatten(node.props.style as never) as { backgroundColor?: string } | undefined)
    ?.backgroundColor;

/** Ce qui est posé dans le contenu, dans l'ordre : une image (sa source), un nuage ou un reflet. */
async function layers(terrainScale?: number) {
  const container = await mount(true, terrainScale);
  return container
    .queryAll(
      (n) => n.type === 'Image' || (n.type === 'View' && AMBIENT_COLORS.includes(colorOf(n))),
    )
    .map((n) =>
      n.type === 'Image'
        ? (n.props.source as unknown)
        : colorOf(n) === mapArt.glint
          ? 'reflet'
          : 'nuage',
    );
}

describe('carte pré-rendue : ce qui est posé sur le sol', () => {
  beforeEach(() => jest.mocked(useMapClock).mockClear());

  it('pose, dans l’ordre, le sol, les tronçons d’avant le pion, les halos puis les disques', async () => {
    const sources = (await world()).map((props) => props.source);
    expect(sources).toEqual([
      // Sous-couche et tuile, puis le seul tronçon parcouru (entre a et b).
      9,
      1,
      100,
      // Halos des niveaux ouverts : a, puis b qui bat (deux lueurs).
      nodeSprites.lueur.source,
      nodeSprites.anneau.source,
      nodeSprites.lueur.source,
      nodeSprites.lueur.source,
      nodeSprites.anneau.source,
      // Disques du fond vers l'avant : b, a, c (verrou), d (grand verrou de l'évaluation).
      nodeSprites.exercices.source,
      nodeSprites.lecon.source,
      nodeSprites.verrou.source,
      nodeSprites['verrou-grand'].source,
    ]);
  });

  it('pose le disque sur le pied du niveau, à l’échelle de la carte', async () => {
    const images = await world();
    const disc = images.find((props) => props.source === nodeSprites.lecon.source)!;
    const scale = 100 / nodeSprites.ppm;
    // Le niveau a est en (1, 0) : 300 dp à droite et 100 dp sous le coin haut gauche du rendu.
    expect(StyleSheet.flatten(disc.style)).toEqual({
      position: 'absolute',
      left: expect.closeTo(300 - nodeSprites.lecon.anchor[0] * scale, 9),
      top: expect.closeTo(100 - nodeSprites.lecon.anchor[1] * scale, 9),
      width: expect.closeTo(nodeSprites.lecon.width * scale, 9),
      height: expect.closeTo(nodeSprites.lecon.height * scale, 9),
      // Au repos : ni rebond ni tremblement.
      opacity: 1,
      transform: [{ translateX: 0 }, { scale: 1 }],
    });
  });

  it('ne fait tourner l’horloge (halo, nuages, reflets) que si les animations le peuvent', async () => {
    await world(true);
    expect(useMapClock).toHaveBeenLastCalledWith(true, false);
    await world(false);
    expect(useMapClock).toHaveBeenLastCalledWith(false, false);
  });
});

describe('carte pré-rendue : la vie de la carte', () => {
  it('pose les nuages sous la sous-couche et les tuiles, là où le rendu est transparent', async () => {
    const order = await layers();
    expect(order.indexOf(9)).toBeGreaterThan(order.lastIndexOf('nuage'));
    expect(order.filter((layer) => layer === 'nuage').length).toBeGreaterThan(0);
  });

  it('pose les reflets sur les tuiles, sous le chemin, quand la carte a de l’eau', async () => {
    // Terrain de l'île à l'échelle 1 : le π (x de −2 à 0,5, z de −1,45 à 0,75) est dans le rendu.
    const order = await layers(1);
    const glints = order.filter((layer) => layer === 'reflet').length;
    expect(glints).toBeGreaterThan(0);
    expect(order.indexOf('reflet')).toBe(order.indexOf(1) + 1);
    expect(order.lastIndexOf('reflet')).toBe(order.indexOf(100) - 1);
  });

  it('ne pose aucun reflet sans terrain cuit', async () => {
    expect(await layers()).not.toContain('reflet');
  });
});

/**
 * La même carte après la leçon b : b est terminée, c s'ouvre et devient le niveau à jouer, et le
 * tronçon entre b et c devient miel.
 */
const AFTER: RegionMap = {
  ...MAP,
  nodes: MAP.nodes.map((n) =>
    n.levelId === 'b'
      ? { ...n, state: 'completed' as const, stars: 3 as const }
      : n.levelId === 'c'
        ? { ...n, state: 'active' as const }
        : n,
  ),
  pawnIndex: 2,
};
const PROGRESS: MapProgress = {
  stars: [{ levelId: 'b', from: 0, to: 3, firstTime: true }],
  gaps: [1],
  unlocked: ['c'],
  cities: [],
};
const PLAN = planCelebration(PROGRESS);

/** La célébration de cette progression, son horloge figée à `t` secondes. */
const celebrationAt = (t: number): MapCelebration => ({
  map: AFTER,
  progress: PROGRESS,
  plan: PLAN,
  clock: fixed(t),
});

/** Style aplati de l'image de cette source, et celui de la vue qui la contient. */
async function imageOf(source: unknown, t: number) {
  const container = await mount(true, undefined, { map: AFTER, celebration: celebrationAt(t) });
  const images = container.queryAll((n) => n.type === 'Image' && n.props.source === source);
  return images.map((image) => ({
    own: StyleSheet.flatten(image.props.style),
    parent: StyleSheet.flatten(image.parent?.props.style),
  }));
}

describe('carte pré-rendue : célébration au retour d’un niveau', () => {
  it('avant son heure, le nouveau tronçon est caché derrière sa fenêtre ; ensuite, il est posé', async () => {
    // Le tronçon 1 va de b (0, −1) vers c (−1, 0,5) : surtout vers le bas, dévoilé de haut en bas.
    const [before] = await imageOf(101, 0);
    expect(before!.parent).toMatchObject({ overflow: 'hidden', transform: [{ translateY: -10 }] });
    expect(before!.own).toMatchObject({ transform: [{ translateY: 10 }] });
    const [after] = await imageOf(101, PLAN.end);
    expect(after!.parent).toMatchObject({ transform: [{ translateY: expect.closeTo(0, 9) }] });
    // Le tronçon déjà parcouru n'est pas animé.
    const [old] = await imageOf(100, 0);
    expect(old!.own.transform).toBeUndefined();
  });

  it('le niveau qui s’ouvre garde son verrou jusqu’à son heure, puis prend sa couleur', async () => {
    const at = PLAN.unlocks[0]!.at;
    const [shellBefore] = await imageOf(nodeSprites.verrou.source, at - 0.1);
    const [colorBefore] = (await imageOf(nodeSprites.lecon.source, at - 0.1)).filter(
      (image) => image.own.opacity === 0,
    );
    expect(shellBefore!.own.opacity).toBe(1);
    expect(colorBefore).toBeDefined();
    const [shellAfter] = await imageOf(nodeSprites.verrou.source, at + CELEBRATION.unlock);
    expect(shellAfter!.own.opacity).toBe(0);
  });

  it('le halo du niveau qui s’ouvre n’apparaît qu’à son ouverture', async () => {
    const at = PLAN.unlocks[0]!.at;
    // Les anneaux de a, b et c : seul celui de c est encore éteint.
    const rings = await imageOf(nodeSprites.anneau.source, at - 0.1);
    expect(rings.map((ring) => ring.own.opacity ?? 1)).toEqual([1, 1, 0]);
    const lit = await imageOf(nodeSprites.anneau.source, at + CELEBRATION.unlock);
    expect(lit.map((ring) => ring.own.opacity ?? 1)).toEqual([1, 1, 1]);
  });

  it('le disque touché s’enfonce ; un disque fermé tremble au lieu de rebondir', async () => {
    // Touché au tiers de sa réponse : le disque ouvert (b, rang 1) est enfoncé.
    const pressed = await mount(true, undefined, {
      touch: { index: fixed(1), progress: fixed(0.3) },
    });
    const disc = pressed.queryAll(
      (n) => n.type === 'Image' && n.props.source === nodeSprites.exercices.source,
    )[0]!;
    expect(StyleSheet.flatten(disc.props.style).transform).toEqual([
      { translateX: 0 },
      { scale: expect.closeTo(0.94, 9) },
    ]);
    // Le disque fermé c (rang 2), touché : il se décale sans changer de taille.
    const shaken = await mount(true, undefined, {
      touch: { index: fixed(2), progress: fixed(0.1) },
    });
    const lock = shaken.queryAll(
      (n) => n.type === 'Image' && n.props.source === nodeSprites.verrou.source,
    )[0]!;
    const [shift, size] = StyleSheet.flatten(lock.props.style).transform as [
      { translateX: number },
      { scale: number },
    ];
    expect(Math.abs(shift.translateX)).toBeGreaterThan(1);
    expect(size.scale).toBe(1);
  });
});
