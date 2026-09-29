/** Mise en forme des durées et des nombres, en français (accueil, stats, espace Parents). */

const NBSP = ' ';

const pad2 = (n: number) => String(n).padStart(2, '0');

/** 35 → « 35 min » ; 65 → « 1 h 05 » ; 720 → « 12 h » (espaces insécables : jamais coupé). */
export function formatDuration(minutes: number): string {
  const total = Math.round(Math.abs(minutes));
  if (total < 60) return `${total}${NBSP}min`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest === 0 ? `${hours}${NBSP}h` : `${hours}${NBSP}h${NBSP}${pad2(rest)}`;
}

/** Séparateur de milliers français (espace insécable) : 1642 → « 1 642 ». */
export function formatCount(n: number): string {
  return String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

const sign = (n: number) => (n < 0 ? '−' : '+');

/** Évolution d'une durée : +38 → « +38 min » ; +130 → « +2 h 10 ». */
export function formatDurationDelta(delta: number): string {
  return `${sign(delta)}${formatDuration(delta)}`;
}

/** Évolution d'un compteur : +310 → « +310 ». */
export function formatCountDelta(delta: number): string {
  return `${sign(delta)}${formatCount(delta)}`;
}
