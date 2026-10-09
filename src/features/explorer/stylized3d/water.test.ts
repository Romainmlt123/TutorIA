import layout from './water.json';

/** Test du point dans le polygone (rayon horizontal), sur le plan (x, z) de l'île. */
function inside(polygon: readonly (readonly [number, number])[], x: number, z: number): boolean {
  let result = false;
  polygon.forEach(([ax, az], i) => {
    const [bx, bz] = polygon[(i + 1) % polygon.length]!;
    if (az > z !== bz > z && x < ax + ((z - az) * (bx - ax)) / (bz - az)) result = !result;
  });
  return result;
}

describe('eau de l’île des Maths', () => {
  it('fait partir la rivière du pied droit du π', () => {
    const { origin, shape } = layout.pi;
    const pi = shape.map(
      ([x, y]) => [origin.x + x! * origin.sx, origin.z - y! * origin.sz] as const,
    );
    const [x, z] = layout.river.points[0]!;
    expect(inside(pi, x!, z!)).toBe(true);
  });

  it('fait tomber la cascade depuis le bord, jusque sous l’île', () => {
    expect(layout.fall[0]).toEqual([0, expect.any(Number)]);
    expect(layout.fall.at(-1)![1]).toBeLessThan(-3);
  });
});
