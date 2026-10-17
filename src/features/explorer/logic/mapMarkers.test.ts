import { islandOf } from '../content';
import { nodeSprites, PRERENDERED_MAPS } from '../tiles';
import type { NodeSprites } from '../tiles/types';
import { MAP_LAYOUT } from './mapLayout';
import {
  backToFront,
  cityBannerAnchor,
  DISC_TOP,
  discFace,
  discSpriteOf,
  doneSegmentsBefore,
  groundSpriteRect,
  haloSpritesOf,
  nodeGround,
} from './mapMarkers';
import { worldToImagePx } from './mapProjection';
import { buildRegionMap } from './regionMap';

const SIN = Math.sin((52 * Math.PI) / 180);
const COS = Math.cos((52 * Math.PI) / 180);

/** Sprites de calcul à la main : 100 px par mètre, deux tailles de rayon (0,25 m et 0,5 m). */
const sprite = (radius: number) => ({
  width: 100,
  height: 80,
  anchor: [50, 40] as const,
  radius,
  source: 0,
});
const SPRITES: NodeSprites = {
  ppm: 100,
  lecon: sprite(0.25),
  exercices: sprite(0.25),
  evaluation: sprite(0.5),
  verrou: sprite(0.25),
  'verrou-grand': sprite(0.5),
  anneau: sprite(0.25),
  'anneau-grand': sprite(0.5),
  lueur: sprite(0.25),
  'lueur-grand': sprite(0.5),
};

/** Coin haut gauche du rendu en (-2, -1) : un point du monde se place à la main. */
const FRAME = { x0: -2, v0: -1 };

describe('carte pré-rendue : chemin parcouru', () => {
  const segments = [0, 1, 2, 3].map((gap) => ({ gap }));

  it('pose les tronçons miel jusqu’au niveau du pion, comme les planches de la carte 3D', () => {
    expect(doneSegmentsBefore(segments, 0)).toEqual([]);
    expect(doneSegmentsBefore(segments, 1)).toEqual([{ gap: 0 }]);
    expect(doneSegmentsBefore(segments, 3)).toEqual([{ gap: 0 }, { gap: 1 }, { gap: 2 }]);
  });

  it('pose tout le chemin quand le pion est au dernier niveau', () => {
    expect(doneSegmentsBefore(segments, 4)).toEqual(segments);
  });
});

describe('carte pré-rendue : disques des niveaux', () => {
  it('prend le disque du type pour un niveau ouvert, le verrou à sa taille pour un niveau fermé', () => {
    expect(discSpriteOf({ type: 'lecon', state: 'active', radius: 0.25 }, SPRITES)).toBe('lecon');
    expect(discSpriteOf({ type: 'exercices', state: 'completed', radius: 0.25 }, SPRITES)).toBe(
      'exercices',
    );
    expect(discSpriteOf({ type: 'evaluation', state: 'active', radius: 0.5 }, SPRITES)).toBe(
      'evaluation',
    );
    expect(discSpriteOf({ type: 'lecon', state: 'locked', radius: 0.25 }, SPRITES)).toBe('verrou');
    expect(discSpriteOf({ type: 'evaluation', state: 'locked', radius: 0.5 }, SPRITES)).toBe(
      'verrou-grand',
    );
  });

  it('prend le halo dont le rayon est le plus proche de celui du niveau', () => {
    expect(haloSpritesOf({ radius: 0.26 }, SPRITES)).toEqual({ ring: 'anneau', glow: 'lueur' });
    expect(haloSpritesOf({ radius: 0.45 }, SPRITES)).toEqual({
      ring: 'anneau-grand',
      glow: 'lueur-grand',
    });
  });

  it('a des sprites rendus pour les deux rayons des niveaux', () => {
    const normal = { radius: MAP_LAYOUT.nodeRadius };
    const big = { radius: MAP_LAYOUT.evaluationRadius };
    expect(nodeSprites.lecon.radius).toBe(normal.radius);
    expect(nodeSprites.evaluation.radius).toBe(big.radius);
    expect(
      nodeSprites[discSpriteOf({ type: 'evaluation', state: 'locked', ...big }, nodeSprites)],
    ).toHaveProperty('radius', big.radius);
    const halo = haloSpritesOf(big, nodeSprites);
    expect([nodeSprites[halo.ring].radius, nodeSprites[halo.glow].radius]).toEqual([
      big.radius,
      big.radius,
    ]);
  });

  it('pose un sprite sur son point d’ancrage, à l’échelle de la carte', () => {
    // 100 dp par mètre de carte, sprites à 100 px par mètre : 1 dp par pixel du sprite.
    const at = nodeGround(FRAME, 100, { x: 1, z: 0 });
    expect(at).toEqual({ x: 300, y: 100 });
    expect(groundSpriteRect(SPRITES.lecon, at, 100 / SPRITES.ppm)).toEqual({
      left: 250,
      top: 60,
      width: 100,
      height: 80,
    });
    // À 50 dp par mètre, le sprite est deux fois plus petit, toujours centré sur son ancrage.
    expect(groundSpriteRect(SPRITES.lecon, { x: 150, y: 50 }, 0.5)).toEqual({
      left: 125,
      top: 30,
      width: 50,
      height: 40,
    });
  });

  it('centre l’icône et le bouton sur le dessus du disque, plus haut que le pied', () => {
    const ground = nodeGround(FRAME, 100, { x: 1, z: 2 });
    const face = discFace(FRAME, 100, { x: 1, z: 2 });
    expect(ground).toEqual({ x: 300, y: expect.closeTo((2 * SIN + 1) * 100, 9) });
    expect(face.x).toBe(300);
    expect(ground.y - face.y).toBeCloseTo(DISC_TOP * COS * 100, 9);
  });

  it('dessine les disques du fond vers l’avant', () => {
    const nodes = [
      { levelId: 'a', z: 1 },
      { levelId: 'b', z: -2 },
      { levelId: 'c', z: 0.5 },
    ];
    expect(backToFront(nodes).map((n) => n.levelId)).toEqual(['b', 'c', 'a']);
    // L'ordre du chemin n'est pas touché.
    expect(nodes.map((n) => n.levelId)).toEqual(['a', 'b', 'c']);
  });
});

describe('carte pré-rendue : bandeaux des villes', () => {
  it('pose le bandeau derrière le cercle des niveaux, en hauteur', () => {
    const [x, y, z] = cityBannerAnchor({ center: { x: 3, z: 4 }, radius: 2.5 });
    expect(x).toBe(3);
    expect(y).toBe(0.3);
    expect(z).toBeCloseTo(4 - (2.5 - MAP_LAYOUT.clearing) - 0.35, 12);
  });
});

describe('carte pré-rendue de Nombres : les tronçons rejoignent les niveaux', () => {
  const tiles = PRERENDERED_MAPS['maths-nombres']!;
  const map = buildRegionMap(islandOf('maths')!, 'maths-nombres', new Map())!;

  it('a un tronçon entre chaque paire de niveaux voisins', () => {
    expect(tiles.doneSegments.map((s) => s.gap)).toEqual(map.nodes.slice(1).map((_, i) => i));
  });

  it('fait arriver chaque tronçon sous les disques de ses deux niveaux', () => {
    tiles.doneSegments.forEach((segment) => {
      for (const node of [map.nodes[segment.gap]!, map.nodes[segment.gap + 1]!]) {
        const at = worldToImagePx(tiles, node.x, node.z);
        // Les planches s'arrêtent au bord du disque : à moins d'un rayon du rectangle du tronçon.
        const reach = node.radius * tiles.ppm;
        const dx = Math.max(segment.x - at.x, 0, at.x - (segment.x + segment.width));
        const dy = Math.max(segment.y - at.y, 0, at.y - (segment.y + segment.height));
        expect(Math.hypot(dx, dy)).toBeLessThan(reach);
      }
    });
  });
});
