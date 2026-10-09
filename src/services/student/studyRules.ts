import { parisTime } from '@/lib/parisTime';

import type { ParentalSettings } from '../parents/ParentService';

/** Raison pour laquelle le tuteur ou les flashcards sont en pause. */
export type StudyBlock = 'evening_pause' | 'outside_window' | 'daily_limit';

type Rules = Pick<
  ParentalSettings,
  'eveningPause' | 'dailyLimitEnabled' | 'dailyLimitMinutes' | 'allowedFrom' | 'allowedUntil'
>;

const EVENING_PAUSE_START = 21 * 60;
const MORNING = 6 * 60;

const minutesOf = (time: string) => {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
};

/**
 * Réglages parentaux appliqués à l'élève (heure de Paris), côté app comme côté serveur :
 * pause après 21 h (jusqu'au matin), plage autorisée et temps maximum par jour.
 */
export function studyBlock(
  rules: Rules,
  todaySeconds: number,
  now = new Date(),
): StudyBlock | null {
  const { hour, minute } = parisTime(now);
  const current = hour * 60 + minute;
  if (rules.eveningPause && (current >= EVENING_PAUSE_START || current < MORNING)) {
    return 'evening_pause';
  }
  if (rules.dailyLimitEnabled) {
    if (current < minutesOf(rules.allowedFrom) || current >= minutesOf(rules.allowedUntil)) {
      return 'outside_window';
    }
    if (todaySeconds >= rules.dailyLimitMinutes * 60) return 'daily_limit';
  }
  return null;
}

/**
 * Temps avant la prochaine pause, en secondes (`null` sans limite) : la pause du soir, la fin de la
 * plage autorisée ou le temps maximum du jour, le plus proche. Le surveillant du vocal raccroche là.
 */
export function secondsUntilBlock(
  rules: Rules,
  todaySeconds: number,
  now = new Date(),
): number | null {
  const { hour, minute } = parisTime(now);
  const elapsed = (hour * 60 + minute) * 60 + now.getUTCSeconds();
  const bounds: number[] = [];
  if (rules.eveningPause) bounds.push(EVENING_PAUSE_START * 60 - elapsed);
  if (rules.dailyLimitEnabled) {
    bounds.push(minutesOf(rules.allowedUntil) * 60 - elapsed);
    bounds.push(rules.dailyLimitMinutes * 60 - todaySeconds);
  }
  return bounds.length ? Math.max(0, Math.min(...bounds)) : null;
}
