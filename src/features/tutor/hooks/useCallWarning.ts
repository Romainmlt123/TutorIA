import { useState } from 'react';

import type { StudyRules } from '@/services/student';
import { secondsUntilBlock } from '@/services/student/studyRules';

import { callWarning, type CallWarning } from '../logic/callWarning';

/**
 * « Plus que 2 minutes » pendant un appel : le temps avant la pause est pris une fois, dès que les
 * règles des parents sont lues (l'appel en cours n'est compté par la base qu'à sa fin).
 */
export function useCallWarning(elapsed: number, rules: StudyRules | undefined): CallWarning | null {
  const [untilPause, setUntilPause] = useState<number | null | undefined>(() =>
    rules ? secondsUntilBlock(rules, rules.todaySeconds) : undefined,
  );
  if (untilPause === undefined && rules) {
    setUntilPause(secondsUntilBlock(rules, rules.todaySeconds));
  }
  return callWarning(elapsed, untilPause ?? null);
}
