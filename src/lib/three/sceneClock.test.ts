import { advanceClock, SCENE_TIME, type SceneClock } from './sceneClock';

describe('horloge des scènes 3D', () => {
  it('avance de la durée de chaque image', () => {
    const clock: SceneClock = { value: 12 };
    advanceClock(clock, 1 / 60, true);
    advanceClock(clock, 1 / 60, true);
    expect(clock.value).toBeCloseTo(12 + 2 / 60);
  });

  it('reste figée quand les animations sont réduites', () => {
    const clock: SceneClock = { value: 3.5 };
    advanceClock(clock, 0.5, false);
    expect(clock.value).toBe(3.5);
  });

  it('ignore une durée nulle, négative ou non finie', () => {
    const clock: SceneClock = { value: 1 };
    for (const delta of [0, -0.2, Number.NaN, Number.POSITIVE_INFINITY]) {
      advanceClock(clock, delta, true);
    }
    expect(clock.value).toBe(1);
  });

  it('se lit comme un uniforme de shader, et part de zéro', () => {
    expect(SCENE_TIME).toEqual({ value: 0 });
  });
});
