import { carouselShot, easeShot, REGIONS_SHOT, shotFor } from './shots';
import { DEFAULT_FRAME } from './stageFrame';

describe('cadrage de la caméra par vue', () => {
  it('cadre le carrousel dans la zone mesurée, comme avant', () => {
    expect(shotFor({ kind: 'carousel' }, DEFAULT_FRAME)).toEqual({
      elevation: 24,
      fill: DEFAULT_FRAME.fill,
      aimY: DEFAULT_FRAME.aimY,
      lookY: -0.9,
      lookX: 0,
      lookZ: 0,
      azimuthRange: Infinity,
    });
  });

  it('monte la caméra pour voir tout le plateau dans les régions', () => {
    const regions = shotFor({ kind: 'regions', subjectId: 'maths' }, DEFAULT_FRAME);
    expect(regions).toBe(REGIONS_SHOT);
    expect(regions.elevation).toBeGreaterThan(carouselShot(DEFAULT_FRAME).elevation);
  });

  it('glisse vers le but sans le dépasser, et saute si les animations sont réduites', () => {
    const from = carouselShot(DEFAULT_FRAME);
    let shot = from;
    for (let i = 0; i < 300; i++) shot = easeShot(shot, REGIONS_SHOT, 1 / 60, true);
    expect(shot.elevation).toBeCloseTo(REGIONS_SHOT.elevation, 1);
    expect(shot.elevation).toBeLessThanOrEqual(REGIONS_SHOT.elevation);
    expect(easeShot(from, REGIONS_SHOT, 1 / 60, false)).toBe(REGIONS_SHOT);
  });

  it('dérive de 30 % vers la région choisie et limite la rotation', () => {
    const shot = shotFor({ kind: 'regions', subjectId: 'maths' }, DEFAULT_FRAME, [2, 1.5]);
    expect(shot.lookX).toBeCloseTo(0.6);
    expect(shot.lookZ).toBeCloseTo(0.45);
    expect(shot.azimuthRange).toBeLessThan(1);
  });
});
