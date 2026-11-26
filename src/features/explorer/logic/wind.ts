import { CLOUD_PHASE_MS, DIVE_MS } from './cinematics';

export const WIND_CYCLES = 6;

export type WindStreak = {
  angle: number;
  startRadius: number;
  length: number;
  width: number;
  speed: number;
  phase: number;
};

/** Produit une distribution stable de stries sans dépendre de l'état global aléatoire. */
export function windStreaks(seed: number, count = 20): WindStreak[] {
  let state = seed >>> 0;
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: Math.min(20, Math.max(0, Math.floor(count))) }, () => ({
    angle: random() * Math.PI * 2,
    startRadius: 0.1 + random() * 0.25,
    length: 0.12 + random() * 0.2,
    width: 1.5 + random() * 2,
    speed: 0.6 + random() * 0.8,
    phase: random(),
  }));
}

/** Intensité normalisée du vent, du début du plongeon à la fin de l'ouverture. */
export function windIntensity(progress: number): number {
  'worklet';
  const t = Math.max(0, Math.min(1, progress));
  const total = DIVE_MS + CLOUD_PHASE_MS;
  const peak = DIVE_MS / total;
  const holdEnd = peak + (CLOUD_PHASE_MS * 0.25) / total;
  if (t <= peak) {
    const rise = t / peak;
    return 1 - (1 - rise) * (1 - rise);
  }
  if (t <= holdEnd) return 1;
  const fall = (t - holdEnd) / (1 - holdEnd);
  return 1 - fall * fall;
}
