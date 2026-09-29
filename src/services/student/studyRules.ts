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
