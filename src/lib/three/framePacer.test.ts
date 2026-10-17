import {
  createPacer,
  FRAME_INTERVAL_MS,
  keepsRunning,
  pace,
  requestFrames,
  rest,
  SETTLE_FRAMES,
  viewChanged,
  type FramePacer,
} from './framePacer';

/** Battements d'un écran à `hz` pendant `seconds`, avec un décalage optionnel par battement (ms). */
function ticks(hz: number, seconds: number, start = 0, jitter: (i: number) => number = () => 0) {
  const count = Math.round(hz * seconds);
  return Array.from({ length: count }, (_, i) => start + (i * 1000) / hz + jitter(i));
}

/** Passe les battements au rythme et rend les heures des images dessinées. */
function drawn(pacer: FramePacer, times: readonly number[]): number[] {
  return times.filter((now) => pace(pacer, now) !== null);
}

describe('rythme des images', () => {
  it('dessine le premier battement, compté pour un intervalle de 60 i/s', () => {
    const pacer = createPacer();
    expect(pace(pacer, 5000)).toBeCloseTo(FRAME_INTERVAL_MS / 1000);
  });

  it('dessine chaque battement d’un écran à 60 Hz', () => {
    const times = ticks(60, 2);
    expect(drawn(createPacer(), times)).toHaveLength(times.length);
  });

  it('plafonne un écran à 120 Hz à 60 images par seconde, sans dérive', () => {
    expect(drawn(createPacer(), ticks(120, 10))).toHaveLength(600);
  });

  it('dessine un battement sur deux à 120 Hz malgré des horodatages irréguliers', () => {
    const jitter = (i: number) => ((i * 7919) % 5) - 2;
    const frames = drawn(createPacer(), ticks(120, 2, 0, jitter));
    expect(frames.length).toBeGreaterThanOrEqual(119);
    expect(frames.length).toBeLessThanOrEqual(121);
    const gaps = frames.slice(1).map((t, i) => t - frames[i]!);
    expect(Math.min(...gaps)).toBeGreaterThan(12);
  });

  it('tient 60 images par seconde sur un écran à 90 Hz', () => {
    const frames = drawn(createPacer(), ticks(90, 10));
    expect(frames.length).toBeGreaterThanOrEqual(599);
    expect(frames.length).toBeLessThanOrEqual(601);
  });

  it('rend la durée réelle écoulée depuis l’image précédente (s)', () => {
    const pacer = createPacer();
    pace(pacer, 0);
    expect(pace(pacer, 8.3)).toBeNull();
    expect(pace(pacer, 16.7)).toBeCloseTo(0.0167);
    expect(pace(pacer, 50)).toBeCloseTo(0.0333);
  });

  it('suit un téléphone trop lent sans rafale pour rattraper son retard', () => {
    const pacer = createPacer();
    const slow = ticks(30, 1);
    expect(drawn(pacer, slow)).toHaveLength(slow.length);
    // Le téléphone retrouve 120 Hz : 60 images par seconde, pas une image à chaque battement.
    const fast = ticks(120, 1, slow[slow.length - 1]! + 1000 / 120);
    const frames = drawn(pacer, fast);
    expect(frames.length).toBeLessThanOrEqual(61);
    const gaps = frames.slice(1).map((t, i) => t - frames[i]!);
    expect(Math.min(...gaps)).toBeGreaterThan(12);
  });

  it('suit un autre plafond quand on le lui donne : 30 images par seconde à 60 comme à 120 Hz', () => {
    const interval = 1000 / 30;
    const at60 = createPacer();
    expect(ticks(60, 10).filter((now) => pace(at60, now, interval) !== null)).toHaveLength(300);
    const at120 = createPacer();
    expect(ticks(120, 10).filter((now) => pace(at120, now, interval) !== null)).toHaveLength(300);
  });

  it('compte la première image pour un intervalle du plafond demandé', () => {
    expect(pace(createPacer(), 0, 1000 / 30)).toBeCloseTo(1 / 30);
  });

  it('ne compte pas la pause au redémarrage', () => {
    const pacer = createPacer();
    pace(pacer, 0);
    pace(pacer, 16.7);
    rest(pacer);
    expect(pace(pacer, 60_000)).toBeCloseTo(FRAME_INTERVAL_MS / 1000);
  });
});

describe('scène au repos (animations réduites)', () => {
  it('tourne sans fin tant que les animations sont jouées', () => {
    expect(keepsRunning(createPacer(), true)).toBe(true);
  });

  it('s’arrête sans demande', () => {
    expect(keepsRunning(createPacer(), false)).toBe(false);
  });

  it('dessine encore quelques images après une demande, puis s’arrête', () => {
    const pacer = createPacer();
    requestFrames(pacer);
    let frames = 0;
    for (const now of ticks(60, 1)) {
      if (!keepsRunning(pacer, false)) break;
      if (pace(pacer, now) !== null) frames++;
    }
    expect(frames).toBe(SETTLE_FRAMES);
  });

  it('ne cumule pas les demandes : la plus longue l’emporte', () => {
    const pacer = createPacer();
    requestFrames(pacer, 2);
    requestFrames(pacer, 5);
    requestFrames(pacer, 1);
    expect(pacer.pending).toBe(5);
  });

  it('ne consomme pas d’image demandée sur un battement sauté', () => {
    const pacer = createPacer();
    pace(pacer, 0);
    requestFrames(pacer, 1);
    expect(pace(pacer, 8.3)).toBeNull();
    expect(keepsRunning(pacer, false)).toBe(true);
    expect(pace(pacer, 16.7)).not.toBeNull();
    expect(keepsRunning(pacer, false)).toBe(false);
  });

  it('oublie les demandes en s’arrêtant', () => {
    const pacer = createPacer();
    requestFrames(pacer);
    rest(pacer);
    expect(keepsRunning(pacer, false)).toBe(false);
  });
});

describe('caméra qui bouge', () => {
  it('compte la première vue comme un changement', () => {
    expect(viewChanged([], [[1, 0, 0, 1]])).toBe(true);
  });

  it('ne voit aucun changement quand les matrices sont les mêmes', () => {
    const memory: number[] = [];
    viewChanged(memory, [
      [1, 2],
      [3, 4],
    ]);
    expect(
      viewChanged(memory, [
        [1, 2],
        [3, 4],
      ]),
    ).toBe(false);
  });

  it('voit une seule valeur changée, dans n’importe quelle matrice, puis la retient', () => {
    const memory: number[] = [];
    viewChanged(memory, [
      [1, 2],
      [3, 4],
    ]);
    expect(
      viewChanged(memory, [
        [1, 2],
        [3, 4.001],
      ]),
    ).toBe(true);
    expect(
      viewChanged(memory, [
        [1, 2],
        [3, 4.001],
      ]),
    ).toBe(false);
  });
});
