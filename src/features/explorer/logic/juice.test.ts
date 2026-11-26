import { CELEBRATION } from './celebration';
import {
  bannerFlipAt,
  confettiAt,
  confettiPieces,
  cueRingAt,
  FLIP_HIDDEN,
  lockedShake,
  PRESS_DIP_SECONDS,
  pressBounce,
  rowAppear,
  segmentReveal,
  SHAKE_DP,
  sparkleAt,
  starPopScale,
  TOUCH_SECONDS,
  unlockAt,
} from './juice';

/** Valeurs d'une courbe de 0 à `end` secondes, au pas d'une image à 120 Hz. */
const sample = (end: number, at: (s: number) => number) =>
  Array.from({ length: Math.ceil(end * 120) + 1 }, (_, i) => at(i / 120));

describe('étoile gagnée', () => {
  it('invisible avant son heure, elle jaillit au-delà de sa taille puis s’y pose', () => {
    expect(starPopScale(-0.1)).toBe(0);
    expect(starPopScale(0)).toBe(0);
    expect(Math.max(...sample(CELEBRATION.starPop, starPopScale))).toBeGreaterThan(1.15);
    expect(starPopScale(CELEBRATION.starPop)).toBe(1);
    expect(starPopScale(5)).toBe(1);
  });

  it('ses étincelles s’allument une fois, puis s’éteignent pour de bon', () => {
    expect(sparkleAt(0).opacity).toBe(0);
    expect(Math.max(...sample(1, (s) => sparkleAt(s).opacity))).toBeGreaterThan(0.9);
    expect(sparkleAt(1).opacity).toBe(0);
  });

  it('la rangée grise d’un niveau terminé pour la première fois apparaît en fondu', () => {
    expect(rowAppear(-1)).toEqual({ opacity: 0, scale: 0.6 });
    expect(rowAppear(CELEBRATION.row)).toEqual({ opacity: 1, scale: 1 });
  });
});

describe('chemin et niveau qui s’ouvre', () => {
  it('le tronçon se dévoile de 0 à 1, sans revenir en arrière', () => {
    const values = sample(CELEBRATION.segmentReveal, segmentReveal);
    expect(segmentReveal(-1)).toBe(0);
    expect(values.at(-1)).toBe(1);
    values.slice(1).forEach((value, i) => expect(value).toBeGreaterThanOrEqual(values[i]!));
  });

  it('avant son heure, le niveau est encore fermé : cadenas et disque gris, ni icône ni halo', () => {
    expect(unlockAt(-0.5)).toEqual({
      color: 0,
      shell: 1,
      lockLift: 0,
      lockOpacity: 1,
      disc: 1,
      icon: 0,
      halo: 0,
    });
  });

  it('le cadenas s’envole et s’efface, le disque rebondit, l’icône et le halo arrivent', () => {
    const middle = unlockAt(0.2);
    expect(middle.lockLift).toBeLessThan(0);
    expect(Math.max(...sample(CELEBRATION.unlock, (s) => unlockAt(s).disc))).toBeGreaterThan(1.08);
    expect(Math.max(...sample(CELEBRATION.unlock, (s) => unlockAt(s).icon))).toBeGreaterThan(1.1);
    expect(unlockAt(CELEBRATION.unlock)).toEqual({
      color: 1,
      shell: 0,
      lockLift: expect.any(Number),
      lockOpacity: 0,
      disc: 1,
      icon: 1,
      halo: 1,
    });
  });
});

describe('bandeau de la ville', () => {
  it('montre l’ancien état, se retourne, puis montre le nouveau en rebondissant', () => {
    expect(bannerFlipAt(-0.2)).toEqual({ front: 1, back: 1 });
    // À mi-retournement, l'ancien état s'aplatit et le nouveau n'est pas encore là.
    const half = bannerFlipAt(0.08);
    expect(half.front).toBeGreaterThan(FLIP_HIDDEN);
    expect(half.front).toBeLessThan(1);
    expect(half.back).toBe(FLIP_HIDDEN);
    expect(Math.max(...sample(CELEBRATION.cityFlip, (s) => bannerFlipAt(s).back))).toBeGreaterThan(
      1.05,
    );
    expect(bannerFlipAt(CELEBRATION.cityFlip)).toEqual({ front: FLIP_HIDDEN, back: 1 });
  });

  it('l’encouragement d’une ville à consolider est un seul anneau doux, qui ne clignote pas', () => {
    const opacities = sample(CELEBRATION.cue, (s) => cueRingAt(s).opacity);
    const peak = opacities.indexOf(Math.max(...opacities));
    // Il monte puis redescend une seule fois, sans jamais dépasser 0,6.
    opacities
      .slice(1, peak)
      .forEach((value, i) => expect(value).toBeGreaterThanOrEqual(opacities[i]!));
    opacities
      .slice(peak + 1)
      .forEach((value, i) => expect(value).toBeLessThanOrEqual(opacities[peak + i]!));
    expect(Math.max(...opacities)).toBeLessThanOrEqual(0.6);
    expect(cueRingAt(CELEBRATION.cue).opacity).toBe(0);
  });
});

describe('confettis', () => {
  const pieces = confettiPieces(36, 5, 42);

  it('sont tirés une fois pour toutes, de toutes les couleurs de la palette', () => {
    expect(confettiPieces(36, 5, 42)).toEqual(pieces);
    expect(pieces).toHaveLength(36);
    expect(new Set(pieces.map((p) => p.color))).toEqual(new Set([0, 1, 2, 3, 4]));
  });

  it('jaillissent au-dessus du bandeau, retombent doucement puis disparaissent', () => {
    for (const piece of pieces) {
      expect(confettiAt(piece.delay / 2, piece).opacity).toBe(0);
      // Hauteurs pendant qu'il se voit (de son départ à la fin de la pluie).
      const flight = sample(CELEBRATION.confetti, (s) => s)
        .filter((s) => confettiAt(s, piece).opacity > 0)
        .map((s) => confettiAt(s, piece).y);
      const top = Math.min(...flight);
      expect(top).toBeLessThan(-40);
      // Après le sommet, ils redescendent lentement (moins de 150 dp par seconde).
      const after = flight.slice(flight.indexOf(top));
      after.slice(1).forEach((y, i) => expect(y - after[i]!).toBeLessThan(150 / 120));
      expect(confettiAt(CELEBRATION.confetti, piece).opacity).toBe(0);
    }
  });
});

describe('toucher un niveau', () => {
  it('un niveau ouvert s’enfonce à 0,94 puis revient à sa taille', () => {
    const values = sample(1, (t) => pressBounce(Math.min(t, 1)));
    expect(pressBounce(0)).toBe(1);
    expect(Math.min(...values)).toBeCloseTo(0.94, 2);
    expect(pressBounce(1)).toBe(1);
  });

  it('l’avatar part quand le disque touché est au plus bas', () => {
    expect(pressBounce(PRESS_DIP_SECONDS / TOUCH_SECONDS)).toBeCloseTo(0.94, 9);
    expect(PRESS_DIP_SECONDS).toBeLessThan(TOUCH_SECONDS / 2);
  });

  it('un niveau fermé tremble à peine, puis revient à sa place', () => {
    const offsets = sample(1, (t) => lockedShake(Math.min(t, 1)));
    expect(lockedShake(0)).toBe(0);
    expect(Math.max(...offsets.map(Math.abs))).toBeLessThanOrEqual(SHAKE_DP);
    expect(Math.max(...offsets.map(Math.abs))).toBeGreaterThan(SHAKE_DP / 2);
    expect(lockedShake(1)).toBe(0);
  });
});
