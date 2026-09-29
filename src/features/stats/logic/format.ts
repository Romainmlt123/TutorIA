import { formatDuration } from '@/lib/format';

export { formatCount, formatCountDelta, formatDuration, formatDurationDelta } from '@/lib/format';

/** Moyenne arrondie par intervalle du graphique (jour, semaine, mois). */
export function averagePerBucket(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

/** Pas « ronds » de l'axe, en minutes. */
const NICE_STEPS = [
  5, 10, 15, 20, 30, 40, 60, 90, 120, 180, 240, 300, 360, 480, 600, 720, 900, 1200,
];

/**
 * Graduation de l'axe à deux paliers (milieu et haut), comme la maquette :
 * 65 min → 40 / 80 min ; 310 min → 3 h / 6 h ; 1 070 min → 10 h / 20 h.
 */
export function niceAxis(maxMinutes: number): { mid: number; max: number } {
  const half = Math.max(maxMinutes, 1) / 2;
  const step = NICE_STEPS.find((s) => s >= half) ?? Math.ceil(half / 600) * 600;
  return { mid: step, max: step * 2 };
}

/**
 * Libellé d'axe, dans l'unité du haut de l'axe : minutes jusqu'à 1 h 30 (« 80 min », « 40 min »),
 * heures au-delà (« 6 h », « 3 h »).
 */
export function formatAxis(minutes: number, axisMax: number): string {
  if (axisMax <= 90) return `${Math.round(minutes)}\u00a0min`;
  return formatDuration(minutes);
}

/** Hauteur des barres en pixels, proportionnelle au haut de l'axe. */
export function scaleBars(values: readonly number[], axisMax: number, height: number): number[] {
  return values.map((v) => (axisMax > 0 ? Math.round((v / axisMax) * height) : 0));
}

/** Jours restants pour battre le record (le dépasser d'un jour). */
export function daysToBeatRecord(current: number, record: number): number {
  return Math.max(0, record - current + 1);
}
