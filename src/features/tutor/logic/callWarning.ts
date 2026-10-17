import { TUTOR_LIMITS } from '@/services/tutor/api-contract';

/** La pastille s'affiche dans les deux dernières minutes. */
export const CALL_WARNING_SECONDS = 120;

/** Ce qui arrive bientôt : la pause décidée avec les parents, ou la fin de l'appel (10 min). */
export type CallWarning = 'pause' | 'end';

/**
 * Le surveillant raccroche à la première des deux limites, sans prévenir : l'écran l'annonce deux
 * minutes avant. `untilPause` est le temps avant la pause au début de l'appel (`null` sans règle).
 */
export function callWarning(elapsed: number, untilPause: number | null): CallWarning | null {
  const callLeft = TUTOR_LIMITS.voiceCallMaxMs / 1000 - elapsed;
  const pauseLeft = untilPause === null ? Infinity : untilPause - elapsed;
  const left = Math.min(callLeft, pauseLeft);
  if (left <= 0 || left > CALL_WARNING_SECONDS) return null;
  return pauseLeft <= callLeft ? 'pause' : 'end';
}
