import { islandOf } from '../content';
import {
  pointAlong,
  QUICK_WALK_SECONDS,
  turnToward,
  walkRoute,
  walkSeconds,
} from '../logic/avatarWalk';
import { buildRegionMap } from '../logic/regionMap';
import {
  advanceChoreo,
  createChoreo,
  JUMP_SECONDS,
  planChoreo,
  SEEN_LEVEL,
  takeArrival,
  tick,
  WAVE_SECONDS,
} from './avatarChoreo';

const map = buildRegionMap(islandOf('maths')!, 'maths-nombres', new Map())!;
const level = (index: number) => map.nodes[index]!.levelId;
/** Une image de 60 i/s. */
const FRAME = 1 / 60;
/** Un peu de marge sur les heures calculées (10 + 1,6 − 10 vaut un rien moins que 1,6). */
const AFTER = 1e-6;

beforeEach(() => SEEN_LEVEL.clear());

describe('chorégraphie de l’avatar sur la carte', () => {
  it('salue à l’ouverture de la carte, sur son niveau, puis attend face à l’élève', () => {
    const c = createChoreo();
    expect(tick(c, map, 2, false, 10, FRAME, true)).toBe('salut');
    expect([c.x, c.z]).toEqual([map.nodes[2]!.x, map.nodes[2]!.z]);
    expect(takeArrival(c)).toBe(level(2));
    expect(takeArrival(c)).toBeNull();
    expect(tick(c, map, 2, false, 10 + WAVE_SECONDS + AFTER, FRAME, true)).toBe('attente');
    expect(c.yaw).toBe(0);
  });

  it('se pose sans saluer quand les animations sont réduites', () => {
    const c = createChoreo();
    expect(tick(c, map, 2, false, 10, FRAME, false)).toBe('attente');
    expect(SEEN_LEVEL.get(map.regionId)).toBe(level(2));
  });

  it('marche le long du chemin vers un nouveau niveau, saute en arrivant, puis attend', () => {
    const c = createChoreo();
    tick(c, map, 2, false, 0, FRAME, true);
    takeArrival(c);
    expect(tick(c, map, 4, false, 5, FRAME, true)).toBe('marche');
    const route = walkRoute(map.path, 2, 4);
    const duration = walkSeconds(route);
    expect(c.duration).toBeCloseTo(duration);
    // À mi-parcours : la position du trajet, sans annonce d'arrivée.
    tick(c, map, 4, false, 5 + duration / 2, FRAME, true);
    const middle = pointAlong(route, route.length / 2);
    expect(c.x).toBeCloseTo(middle.x);
    expect(c.z).toBeCloseTo(middle.z);
    expect(takeArrival(c)).toBeNull();
    // Au bout : le saut, l'arrivée annoncée une fois, le niveau retenu pour la session.
    expect(tick(c, map, 4, false, 5 + duration + AFTER, FRAME, true)).toBe('saut');
    expect([c.x, c.z]).toEqual([expect.closeTo(map.nodes[4]!.x), expect.closeTo(map.nodes[4]!.z)]);
    expect(takeArrival(c)).toBe(level(4));
    expect(SEEN_LEVEL.get(map.regionId)).toBe(level(4));
    const landed = 5 + duration + AFTER;
    expect(tick(c, map, 4, false, landed + JUMP_SECONDS + AFTER, FRAME, true)).toBe('attente');
  });

  it('se tourne peu à peu vers la direction de la marche', () => {
    const c = createChoreo();
    tick(c, map, 0, false, 0, FRAME, true);
    tick(c, map, 3, false, 1, FRAME, true);
    const route = walkRoute(map.path, 0, 3);
    const heading = pointAlong(route, route.length / 2).heading;
    for (let t = 1; t < 1 + c.duration / 2; t += FRAME) tick(c, map, 3, false, t, FRAME, true);
    // Le cap suit en douceur : un peu en retard dans les courbes.
    expect(Math.abs(turnToward(c.yaw, heading))).toBeLessThan(0.1);
  });

  it('repart du dernier niveau atteint quand la carte se rouvre', () => {
    SEEN_LEVEL.set(map.regionId, level(1));
    const c = createChoreo();
    expect(tick(c, map, 3, false, 0, FRAME, true)).toBe('marche');
    expect(c.route!.points[0]).toEqual(walkRoute(map.path, 1, 3).points[0]);
  });

  it('marche vite vers un niveau touché', () => {
    const c = createChoreo();
    tick(c, map, 0, false, 0, FRAME, true);
    tick(c, map, map.nodes.length - 1, true, 1, FRAME, true);
    expect(c.duration).toBeLessThanOrEqual(QUICK_WALK_SECONDS);
  });

  it('repart du niveau le plus proche quand le but change en pleine marche', () => {
    const c = createChoreo();
    tick(c, map, 0, false, 0, FRAME, true);
    tick(c, map, 6, false, 1, FRAME, true);
    // Presque arrivée au niveau 6 : elle repart de lui vers le niveau 2.
    tick(c, map, 6, false, 1 + c.duration * 0.98, FRAME, true);
    tick(c, map, 2, false, 1 + c.duration, FRAME, true);
    expect(c.route!.points[0]).toEqual(walkRoute(map.path, 6, 2).points[0]);
  });
});

describe('chorégraphie dont le trajet est prévu ailleurs (carte pré-rendue)', () => {
  it('avance les phases sans rien prévoir : la marche puis le saut', () => {
    const c = createChoreo();
    planChoreo(c, map, 1, 0, true, false);
    planChoreo(c, map, 2, 0, true, false);
    expect(advanceChoreo(c, c.duration / 2, FRAME, true)).toBe('marche');
    expect(advanceChoreo(c, c.duration + AFTER, FRAME, true)).toBe('saut');
    expect(c.levelId).toBe(level(2));
  });

  it('ne change pas de cap sur une image de durée nulle', () => {
    const c = createChoreo();
    planChoreo(c, map, 0, 0, true, false);
    planChoreo(c, map, 3, 0, true, false);
    advanceChoreo(c, c.duration / 2, 0, true);
    expect(c.yaw).toBe(0);
  });
});
