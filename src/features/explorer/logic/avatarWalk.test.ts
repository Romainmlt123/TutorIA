import { islandOf } from '../content';
import { MAX_WALK_SECONDS, pointAlong, turnToward, walkRoute, walkSeconds } from './avatarWalk';
import { buildRegionMap } from './regionMap';

const map = buildRegionMap(islandOf('maths')!, 'maths-nombres', new Map())!;

describe('trajet de l’avatar sur la carte', () => {
  it('part du point de départ et arrive exactement sur le point d’arrivée', () => {
    const route = walkRoute(map.path, 2, 5);
    const [start, end] = [map.nodes[2]!, map.nodes[5]!];
    expect(route.points[0]!.x).toBeCloseTo(start.x);
    expect(route.points[0]!.z).toBeCloseTo(start.z);
    expect(route.points[route.points.length - 1]!.x).toBeCloseTo(end.x);
    expect(route.points[route.points.length - 1]!.z).toBeCloseTo(end.z);
  });

  it('suit le chemin, plus long que la ligne droite, avec des distances croissantes', () => {
    const route = walkRoute(map.path, 0, 8);
    const [a, b] = [map.nodes[0]!, map.nodes[8]!];
    expect(route.length).toBeGreaterThan(Math.hypot(b.x - a.x, b.z - a.z));
    route.at.forEach((d, i) => expect(d).toBeGreaterThanOrEqual(route.at[i - 1] ?? 0));
  });

  it('marche à l’envers quand le pion recule', () => {
    const forward = walkRoute(map.path, 1, 3);
    const back = walkRoute(map.path, 3, 1);
    expect(back.points).toEqual([...forward.points].reverse());
    expect(back.length).toBeCloseTo(forward.length);
  });

  it('donne la position et le cap le long du trajet', () => {
    const route = walkRoute(map.path, 0, 1);
    const start = pointAlong(route, 0);
    const end = pointAlong(route, route.length + 3);
    expect(start.x).toBeCloseTo(map.nodes[0]!.x);
    expect(end.x).toBeCloseTo(map.nodes[1]!.x);
    expect(end.z).toBeCloseTo(map.nodes[1]!.z);
    const middle = pointAlong(route, route.length / 2);
    const ahead = pointAlong(route, route.length / 2 + 0.05);
    expect(middle.heading).toBeCloseTo(Math.atan2(ahead.x - middle.x, ahead.z - middle.z), 1);
  });

  it('reste sur place pour un trajet d’un seul point', () => {
    const route = walkRoute(map.path, 4, 4);
    expect(route.length).toBe(0);
    expect(pointAlong(route, 1).x).toBeCloseTo(map.nodes[4]!.x);
  });

  it('ne dure jamais plus de quelques secondes', () => {
    const long = walkRoute(map.path, 0, map.nodes.length - 1);
    expect(walkSeconds(long)).toBeLessThanOrEqual(MAX_WALK_SECONDS);
  });

  it('tourne toujours par le plus court côté', () => {
    expect(turnToward(3, -3)).toBeCloseTo(2 * Math.PI - 6);
    expect(turnToward(0, 1)).toBeCloseTo(1);
  });
});
