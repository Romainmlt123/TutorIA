import {
  addFrame,
  countContext,
  createFrameWindow,
  frameStats,
  getMapPerf,
  getPerf,
  mapPerfOf,
  publishMapPerf,
  publishPerf,
  subscribePerf,
  type PerfSnapshot,
} from './perfStats';

const frames = (window: ReturnType<typeof createFrameWindow>, deltaMs: number, count: number) => {
  for (let i = 0; i < count; i++) addFrame(window, deltaMs);
};

describe('temps d’image sur une fenêtre glissante', () => {
  it('rend des zéros tant qu’aucune image n’est mesurée', () => {
    expect(frameStats(createFrameWindow())).toEqual({ fps: 0, p50: 0, p95: 0, max: 0 });
  });

  it('donne les images par seconde et les temps médian et p95', () => {
    const window = createFrameWindow();
    frames(window, 1000 / 60, 120);
    const stats = frameStats(window);
    expect(stats.fps).toBeCloseTo(60, 5);
    expect(stats.p50).toBeCloseTo(16.67, 1);
    expect(stats.p95).toBeCloseTo(16.67, 1);
    expect(stats.max).toBeCloseTo(16.67, 1);
  });

  it('fait ressortir les images lentes dans le p95', () => {
    const window = createFrameWindow();
    frames(window, 16, 90);
    frames(window, 40, 10);
    const stats = frameStats(window);
    expect(stats.p50).toBe(16);
    expect(stats.p95).toBe(40);
    expect(stats.max).toBe(40);
  });

  it('oublie les images sorties des deux dernières secondes', () => {
    const window = createFrameWindow();
    frames(window, 10, 150);
    frames(window, 20, 100);
    expect(frameStats(window)).toEqual({ fps: 50, p50: 20, p95: 20, max: 20 });
  });

  it('garde un accroc plus court que la fenêtre (chargement de textures), même rare', () => {
    const window = createFrameWindow();
    frames(window, 16, 20);
    addFrame(window, 1500);
    const stats = frameStats(window);
    // Une seule image sur 21 : le p95 ne la voit pas, le pire temps et le rythme si.
    expect(stats.p95).toBe(16);
    expect(stats.max).toBe(1500);
    expect(stats.fps).toBeCloseTo(21 / 1.82, 5);
  });

  it('prend un écart plus long que la fenêtre pour une pause, et repart de zéro', () => {
    const window = createFrameWindow();
    frames(window, 16, 30);
    addFrame(window, 8000);
    expect(frameStats(window)).toEqual({ fps: 0, p50: 0, p95: 0, max: 0 });
    frames(window, 20, 10);
    expect(frameStats(window)).toEqual({ fps: 50, p50: 20, p95: 20, max: 20 });
  });

  it('ignore les durées nulles, négatives ou non finies', () => {
    const window = createFrameWindow();
    frames(window, 20, 10);
    [0, -5, Number.NaN, Number.POSITIVE_INFINITY].forEach((delta) => addFrame(window, delta));
    expect(frameStats(window)).toEqual({ fps: 50, p50: 20, p95: 20, max: 20 });
  });
});

describe('relevé publié pour le compteur', () => {
  const snapshot: PerfSnapshot = {
    fps: 60,
    p50: 16.6,
    p95: 18,
    max: 22,
    glLag: 0.4,
    calls: 42,
    triangles: 512_000,
    textures: 30,
    geometries: 120,
    contextId: 3,
    contexts: 1,
    renderRatio: 2,
  };

  it('prévient les abonnés et garde le dernier relevé', () => {
    const listener = jest.fn();
    const unsubscribe = subscribePerf(listener);
    publishPerf(snapshot);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getPerf()).toBe(snapshot);
    unsubscribe();
    publishPerf(null);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getPerf()).toBeNull();
  });

  it('garde à part le relevé d’une carte pré-rendue, et ne prévient que s’il change', () => {
    const listener = jest.fn();
    const unsubscribe = subscribePerf(listener);
    const steady = { rate: 30, fps: 60, p95: 17, max: 17, late: 0 };
    publishMapPerf(steady);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getMapPerf()).toBe(steady);
    expect(getPerf()).toBeNull();
    // Même relevé arrondi : pas de nouvel affichage, donc pas de commit React pendant un lancer.
    publishMapPerf({ ...steady });
    expect(listener).toHaveBeenCalledTimes(1);
    publishMapPerf({ ...steady, late: 2 });
    expect(listener).toHaveBeenCalledTimes(2);
    publishMapPerf(null);
    expect(getMapPerf()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(3);
    publishMapPerf(null);
    expect(listener).toHaveBeenCalledTimes(3);
    unsubscribe();
  });
});

describe('relevé d’une carte pré-rendue sur le fil de l’interface', () => {
  const at60 = 1000 / 60;

  it('compte les pas de l’horloge et les images par seconde', () => {
    const deltas = Array.from({ length: 30 }, () => at60);
    expect(mapPerfOf(15, deltas)).toEqual({ rate: 30, fps: 60, p95: 17, max: 17, late: 0 });
  });

  it('donne 0 pas quand l’horloge est figée, même si les images continuent', () => {
    expect(
      mapPerfOf(
        0,
        Array.from({ length: 30 }, () => at60),
      ).rate,
    ).toBe(0);
  });

  it('compte les images en retard d’au moins une image d’écran, et la pire', () => {
    const deltas = [...Array.from({ length: 27 }, () => at60), 2 * at60, 3 * at60, 1.4 * at60];
    expect(mapPerfOf(15, deltas)).toMatchObject({ max: 50, late: 2 });
  });

  it('prend l’image médiane pour image d’écran : un écran à 120 Hz a ses propres retards', () => {
    const deltas = [...Array.from({ length: 58 }, () => 1000 / 120), 1000 / 60, 1000 / 60];
    expect(mapPerfOf(15, deltas)).toMatchObject({ fps: 116, late: 2 });
  });

  it('ignore les durées nulles, négatives ou non finies, et rend des zéros sans image', () => {
    expect(mapPerfOf(3, [0, -5, Number.NaN])).toEqual({
      rate: 0,
      fps: 0,
      p95: 0,
      max: 0,
      late: 0,
    });
  });
});

describe('contextes 3D créés depuis le lancement', () => {
  it('compte chaque contexte une seule fois', () => {
    const first = {};
    const count = countContext(first);
    expect(countContext(first)).toBe(count);
    expect(countContext({})).toBe(count + 1);
  });
});
