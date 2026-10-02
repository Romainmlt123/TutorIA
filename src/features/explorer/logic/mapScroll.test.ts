import {
  beginScroll,
  coastScroll,
  createScroll,
  dragScroll,
  goTo,
  jumpTo,
  releaseScroll,
  setBounds,
  type Bounds,
} from './mapScroll';

const PX = 90;
const PZ = 80;
const BOX: Bounds = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };

function scrollOf(bounds: Bounds = BOX) {
  const scroll = createScroll();
  setBounds(scroll, bounds);
  return scroll;
}

describe('déplacement sur la carte', () => {
  it('suit le doigt : glisser à gauche avance à droite, glisser vers le haut avance vers la caméra', () => {
    const scroll = scrollOf();
    beginScroll(scroll);
    dragScroll(scroll, -PX * 2, -PZ * 3, PX, PZ);
    expect(scroll.x).toBeCloseTo(2);
    expect(scroll.z).toBeCloseTo(3);
    dragScroll(scroll, -PX, 0, PX, PZ);
    expect(scroll.x).toBeCloseTo(1);
    expect(scroll.z).toBeCloseTo(0);
  });

  it('résiste au-delà des bords, puis revient doucement', () => {
    const scroll = scrollOf();
    beginScroll(scroll);
    dragScroll(scroll, PX * 3, PZ * 6, PX, PZ);
    expect(scroll.x).toBeCloseTo(-1);
    expect(scroll.z).toBeCloseTo(-2);
    releaseScroll(scroll, 0, 0, PX, PZ, true);
    for (let i = 0; i < 120; i++) coastScroll(scroll, 1 / 60);
    expect(scroll.x).toBe(0);
    expect(scroll.z).toBe(0);
  });

  it('garde son élan au lâcher, puis s’arrête sans sortir du rectangle', () => {
    const scroll = scrollOf({ minX: 0, maxX: 3, minZ: 0, maxZ: 3 });
    beginScroll(scroll);
    releaseScroll(scroll, -PX * 8, -PZ * 8, PX, PZ, true);
    for (let i = 0; i < 300; i++) coastScroll(scroll, 1 / 60);
    expect(scroll.x).toBeLessThanOrEqual(3);
    expect(scroll.z).toBeLessThanOrEqual(3);
    expect(scroll.vx).toBe(0);
    expect(scroll.vz).toBe(0);
    expect(scroll.x).toBeGreaterThan(0);
    expect(scroll.z).toBeGreaterThan(0);
  });

  it('s’arrête net sans élan quand les animations sont réduites', () => {
    const scroll = scrollOf();
    beginScroll(scroll);
    releaseScroll(scroll, -PX * 8, -PZ * 8, PX, PZ, false);
    coastScroll(scroll, 0.1);
    expect(scroll).toMatchObject({ x: 0, z: 0 });
  });

  it('saute à un point, borné', () => {
    const scroll = scrollOf({ minX: 1, maxX: 4, minZ: 2, maxZ: 5 });
    jumpTo(scroll, 99, 99);
    expect(scroll).toMatchObject({ x: 4, z: 5 });
    jumpTo(scroll, -5, -5);
    expect(scroll).toMatchObject({ x: 1, z: 2 });
    setBounds(scroll, { minX: 0, maxX: 2, minZ: 0, maxZ: 1 });
    expect(scroll).toMatchObject({ x: 1, z: 1 });
  });

  it('ramène un rectangle trop petit à un point', () => {
    const scroll = scrollOf({ minX: 3, maxX: 1, minZ: 2, maxZ: 0 });
    jumpTo(scroll, 5, 5);
    expect(scroll).toMatchObject({ x: 3, z: 2 });
  });

  it('glisse d’elle-même vers un point, puis s’arrête dessus', () => {
    const scroll = scrollOf();
    goTo(scroll, 6, 7);
    for (let i = 0; i < 240; i++) coastScroll(scroll, 1 / 60);
    expect(scroll).toMatchObject({ x: 6, z: 7, goal: null });
  });

  it('abandonne sa destination dès que le doigt reprend la carte, et saute sans animation', () => {
    const scroll = scrollOf();
    goTo(scroll, 6, 6);
    beginScroll(scroll);
    expect(scroll.goal).toBeNull();
    goTo(scroll, 4, 3);
    releaseScroll(scroll, 0, 0, PX, PZ, true);
    coastScroll(scroll, 1 / 60, false);
    expect(scroll).toMatchObject({ x: 4, z: 3 });
  });
});
