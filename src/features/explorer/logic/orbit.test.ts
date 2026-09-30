import {
  beginDrag,
  coast,
  createOrbit,
  DEFAULT_AZIMUTH,
  drag,
  RADIANS_PER_PIXEL,
  release,
} from './orbit';

describe('rotation de l’île au doigt', () => {
  it('suit le doigt pendant le glissement', () => {
    const orbit = createOrbit();
    beginDrag(orbit);
    drag(orbit, 160);
    expect(orbit.azimuth).toBeCloseTo(DEFAULT_AZIMUTH - 160 * RADIANS_PER_PIXEL);
    drag(orbit, -80);
    expect(orbit.azimuth).toBeCloseTo(DEFAULT_AZIMUTH + 80 * RADIANS_PER_PIXEL);
  });

  it('garde son élan au lâcher, puis ralentit jusqu’à l’arrêt', () => {
    const orbit = createOrbit();
    beginDrag(orbit);
    release(orbit, -800, true);
    const before = orbit.azimuth;
    coast(orbit, 0.1);
    expect(orbit.azimuth).toBeGreaterThan(before);
    for (let i = 0; i < 200; i++) coast(orbit, 1 / 60);
    expect(orbit.velocity).toBe(0);
  });

  it('s’arrête net si les animations sont réduites', () => {
    const orbit = createOrbit();
    beginDrag(orbit);
    release(orbit, -800, false);
    coast(orbit, 0.1);
    expect(orbit.azimuth).toBe(DEFAULT_AZIMUTH);
  });

  it('reprend depuis son angle actuel au glissement suivant', () => {
    const orbit = createOrbit();
    beginDrag(orbit);
    drag(orbit, 160);
    release(orbit, 0, true);
    const angle = orbit.azimuth;
    beginDrag(orbit);
    drag(orbit, 0);
    expect(orbit.azimuth).toBe(angle);
  });
});
