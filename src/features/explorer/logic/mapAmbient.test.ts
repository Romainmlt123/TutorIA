import {
  AMBIENT_RATE,
  ambientTick,
  cloudShift,
  GLINT_DRIFT,
  GLINT_GROUPS,
  glintAt,
  haloBeat,
  haloPulseOpacity,
} from './mapAmbient';

describe('horloge des animations de la carte pré-rendue', () => {
  it('avance par pas de 1/30 s : la carte au repos ne se redessine que 30 fois par seconde', () => {
    expect(AMBIENT_RATE).toBe(30);
    expect(ambientTick(0)).toBe(0);
    expect(ambientTick(0.02)).toBe(0);
    expect(ambientTick(0.034)).toBeCloseTo(1 / 30, 12);
    expect(ambientTick(1.01)).toBeCloseTo(1, 12);
  });

  it('change de valeur 30 fois par seconde, même à 120 images par seconde', () => {
    const ticks = new Set(Array.from({ length: 120 }, (_, i) => ambientTick(i / 120)));
    expect(ticks.size).toBe(30);
  });
});

describe('halo du niveau à jouer', () => {
  it('bat comme le halo de la carte 3D (levelNodes.ts) : de 1 à 1,6 fois sa lumière', () => {
    expect(haloBeat(0)).toBeCloseTo(1.3, 12);
    expect(haloBeat(Math.PI / 2 / 3.2)).toBeCloseTo(1.6, 12);
    expect(haloBeat((3 * Math.PI) / 2 / 3.2)).toBeCloseTo(1, 12);
    for (let t = 0; t < 5; t += 0.05) {
      expect(haloBeat(t)).toBeCloseTo(1 + 0.6 * (0.5 + 0.5 * Math.sin(3.2 * t)), 12);
    }
  });

  it('ajoute une seconde lueur, dont l’opacité est la lumière en plus (de 0 à 0,6)', () => {
    expect(haloPulseOpacity(0)).toBeCloseTo(0.3, 12);
    for (let t = 0; t < 5; t += 0.05) {
      const opacity = haloPulseOpacity(t);
      expect(opacity).toBeGreaterThanOrEqual(0);
      expect(opacity).toBeLessThanOrEqual(0.6 + 1e-12);
      expect(opacity).toBeCloseTo(haloBeat(t) - 1, 12);
    }
  });
});

describe('reflets du soleil sur l’eau', () => {
  /** États d'un groupe sur `seconds` secondes, au pas de l'horloge (30 par seconde). */
  const states = (group: number, seconds = 60) =>
    Array.from({ length: seconds * AMBIENT_RATE }, (_, i) => glintAt(i / AMBIENT_RATE, group));

  it('brillent un peu plus d’un tiers du temps, et restent éteints le reste', () => {
    for (let group = 0; group < GLINT_GROUPS; group++) {
      const all = states(group);
      const lit = all.filter((state) => state.opacity > 0).length / all.length;
      expect(lit).toBeGreaterThan(0.3);
      expect(lit).toBeLessThan(0.4);
    }
  });

  it('s’allument et s’éteignent en douceur, jusqu’à l’éclat plein, en grossissant', () => {
    const all = states(2);
    const opacities = all.map((state) => state.opacity);
    expect(Math.min(...opacities)).toBe(0);
    expect(Math.max(...opacities)).toBeGreaterThan(0.99);
    expect(Math.max(...opacities)).toBeLessThanOrEqual(1);
    for (let i = 1; i < all.length; i++) {
      // Jamais de saut d'éclat d'un pas à l'autre : un scintillement, pas un clignotement.
      expect(Math.abs(all[i]!.opacity - all[i - 1]!.opacity)).toBeLessThan(0.25);
    }
    const lit = all.filter((state) => state.opacity > 0);
    expect(Math.min(...lit.map((state) => state.scale))).toBeGreaterThanOrEqual(0.5);
    expect(Math.max(...lit.map((state) => state.scale))).toBeLessThanOrEqual(1.2);
  });

  it('glissent lentement dans le sens des vaguelettes pendant qu’ils brillent', () => {
    const lit = states(0).filter((state) => state.opacity > 0);
    for (const state of lit) {
      const along = Math.hypot(state.dx, state.dv);
      expect(along).toBeLessThanOrEqual(GLINT_DRIFT / 2 + 1e-12);
      // Vers la droite et vers la caméra (le bas de l'écran), comme le premier train d'ondes de water.ts.
      if (along > 1e-6)
        expect(state.dv / state.dx).toBeCloseTo((0.9 * Math.sin((52 * Math.PI) / 180)) / 0.45, 6);
    }
    const travel = lit.map((state) => state.dx);
    expect(Math.max(...travel) - Math.min(...travel)).toBeGreaterThan(GLINT_DRIFT * 0.4);
  });

  it('ne scintillent pas tous ensemble : chaque groupe a son rythme', () => {
    const patterns = Array.from({ length: GLINT_GROUPS }, (_, group) =>
      states(group).map((state) => state.opacity > 0),
    );
    patterns.forEach((a, i) =>
      patterns.slice(i + 1).forEach((b) => {
        const same = a.filter((lit, step) => lit === b[step]).length;
        expect(same / a.length).toBeLessThan(0.8);
      }),
    );
  });
});

describe('nuages sous l’île', () => {
  it('ne bougent pas à l’arrêt, puis dérivent vers la droite à leur vitesse', () => {
    expect(cloudShift(0, 2, 0.1, -10, 10)).toBe(0);
    expect(cloudShift(10, 2, 0.1, -10, 10)).toBeCloseTo(1, 12);
    expect(cloudShift(30, -4, 0.05, -10, 10)).toBeCloseTo(1.5, 12);
  });

  it('reviennent par la gauche en sortant de l’intervalle, sans en sortir jamais', () => {
    // Parti de x = 8 à 1 m/s : sorti à droite (x = 10) au bout de 2 s, il repart de x = −10.
    expect(8 + cloudShift(1.9, 8, 1, -10, 10)).toBeCloseTo(9.9, 9);
    expect(8 + cloudShift(2.1, 8, 1, -10, 10)).toBeCloseTo(-9.9, 9);
    for (let t = 0; t < 200; t += 0.7) {
      const x = 3 + cloudShift(t, 3, 0.13, -10, 10);
      expect(x).toBeGreaterThanOrEqual(-10);
      expect(x).toBeLessThan(10);
    }
  });
});
