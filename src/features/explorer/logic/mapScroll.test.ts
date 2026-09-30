import {
  beginScroll,
  coastScroll,
  createScroll,
  dragScroll,
  goTo,
  jumpTo,
  releaseScroll,
  setBounds,
} from './mapScroll';

const PX = 90;

function scrollOf(min = 0, max = 10) {
  const scroll = createScroll();
  setBounds(scroll, min, max);
  return scroll;
}

describe('défilement de la carte', () => {
  it('suit le doigt : glisser à gauche avance dans la carte', () => {
    const scroll = scrollOf();
    beginScroll(scroll);
    dragScroll(scroll, -PX * 2, PX);
    expect(scroll.x).toBeCloseTo(2);
    dragScroll(scroll, -PX, PX);
    expect(scroll.x).toBeCloseTo(1);
  });

  it('résiste au-delà des bouts, puis revient doucement', () => {
    const scroll = scrollOf();
    beginScroll(scroll);
    dragScroll(scroll, PX * 3, PX);
    expect(scroll.x).toBeCloseTo(-1);
    releaseScroll(scroll, 0, PX, true);
    for (let i = 0; i < 120; i++) coastScroll(scroll, 1 / 60);
    expect(scroll.x).toBe(0);
  });

  it('garde son élan au lâcher, puis s’arrête sans dépasser le bout', () => {
    const scroll = scrollOf(0, 3);
    beginScroll(scroll);
    releaseScroll(scroll, -PX * 8, PX, true);
    for (let i = 0; i < 300; i++) coastScroll(scroll, 1 / 60);
    expect(scroll.x).toBeLessThanOrEqual(3);
    expect(scroll.velocity).toBe(0);
    expect(scroll.x).toBeGreaterThan(0);
  });

  it('s’arrête net sans élan quand les animations sont réduites', () => {
    const scroll = scrollOf();
    beginScroll(scroll);
    releaseScroll(scroll, -PX * 8, PX, false);
    coastScroll(scroll, 0.1);
    expect(scroll.x).toBe(0);
  });

  it('saute à une position, bornée', () => {
    const scroll = scrollOf(1, 4);
    jumpTo(scroll, 99);
    expect(scroll.x).toBe(4);
    jumpTo(scroll, -5);
    expect(scroll.x).toBe(1);
    setBounds(scroll, 0, 2);
    expect(scroll.x).toBe(1);
  });

  it('glisse d’elle-même vers une position, puis s’arrête dessus', () => {
    const scroll = scrollOf(0, 10);
    goTo(scroll, 6);
    for (let i = 0; i < 240; i++) coastScroll(scroll, 1 / 60);
    expect(scroll.x).toBe(6);
    expect(scroll.goal).toBeNull();
  });

  it('abandonne sa destination dès que le doigt reprend la carte, et saute sans animation', () => {
    const scroll = scrollOf(0, 10);
    goTo(scroll, 6);
    beginScroll(scroll);
    expect(scroll.goal).toBeNull();
    goTo(scroll, 4);
    releaseScroll(scroll, 0, PX, true);
    coastScroll(scroll, 1 / 60, false);
    expect(scroll.x).toBe(4);
  });
});
