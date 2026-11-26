import { CLOUD_PHASE_MS, DIVE_MS } from './cinematics';
import { WIND_CYCLES, windIntensity, windStreaks } from './wind';

describe('stries de vent', () => {
  it('génère des stries déterministes et bornées', () => {
    const first = windStreaks(1234);
    expect(first).toEqual(windStreaks(1234));
    expect(first).not.toEqual(windStreaks(4321));
    expect(first).toHaveLength(20);
    expect(windStreaks(1234, 50)).toHaveLength(20);
    expect(windStreaks(1234, -1)).toHaveLength(0);
    for (const streak of first) {
      expect(streak.angle).toBeGreaterThanOrEqual(0);
      expect(streak.angle).toBeLessThan(Math.PI * 2);
      expect(streak.startRadius).toBeGreaterThanOrEqual(0.1);
      expect(streak.startRadius).toBeLessThanOrEqual(0.35);
      expect(streak.length).toBeGreaterThanOrEqual(0.12);
      expect(streak.length).toBeLessThanOrEqual(0.32);
      expect(streak.width).toBeGreaterThanOrEqual(1.5);
      expect(streak.width).toBeLessThanOrEqual(3.5);
      expect(streak.speed).toBeGreaterThanOrEqual(0.6);
      expect(streak.speed).toBeLessThanOrEqual(1.4);
      expect(streak.phase).toBeGreaterThanOrEqual(0);
      expect(streak.phase).toBeLessThan(1);
    }
    expect(WIND_CYCLES).toBe(6);
  });

  it('monte au changement de scène, tient brièvement puis retombe', () => {
    const total = DIVE_MS + CLOUD_PHASE_MS;
    const sceneChange = DIVE_MS / total;
    const holdEnd = sceneChange + (CLOUD_PHASE_MS * 0.25) / total;
    expect(windIntensity(0)).toBe(0);
    expect(windIntensity(sceneChange / 2)).toBeCloseTo(0.75);
    expect(windIntensity(600 / total)).toBeCloseTo(0.4375);
    expect(windIntensity(sceneChange)).toBe(1);
    expect(windIntensity(holdEnd)).toBe(1);
    expect(windIntensity(1)).toBe(0);
    expect(windIntensity(-1)).toBe(0);
    expect(windIntensity(2)).toBe(0);
  });
});
