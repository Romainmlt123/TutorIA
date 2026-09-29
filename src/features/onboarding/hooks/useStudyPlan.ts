import { chaptersOfSubject } from '@/data/curriculum';
import type { OnboardingAnswers } from '@/data/types';
import { fr } from '@/i18n/fr';
import { subjectTheme } from '@/theme';

import { buildStudyPlan, DEFAULT_DAILY_MINUTES, preferredMoment } from '../logic/onboarding';

/** Plan de O5, mis en forme : matière la moins à l'aise d'abord, puis la suivante et son chapitre. */
export function useStudyPlan(answers: OnboardingAnswers) {
  const t = fr.onboarding.ready;
  const [first, then] = buildStudyPlan(answers.selfAssessment);
  const moment = preferredMoment(answers.moments);
  const minutes = answers.dailyMinutes ?? DEFAULT_DAILY_MINUTES;
  const steps = [];
  if (first) {
    steps.push({
      subjectId: first.subjectId,
      kicker: t.first,
      title: subjectTheme(first.subjectId).name,
      reason: t.reasons[first.level ?? 'none'],
    });
  }
  if (then) {
    const chapter = chaptersOfSubject(then.subjectId)[0];
    const name = subjectTheme(then.subjectId).name;
    steps.push({
      subjectId: then.subjectId,
      kicker: t.then,
      title: chapter ? `${name} · ${chapter.title}` : name,
      reason: answers.grade ? t.curriculum(answers.grade) : t.curriculumDefault,
    });
  }
  return {
    steps,
    daily: t.daily(minutes),
    dailyHint: moment ? t.dailyHint(t.moments[moment]) : t.dailyHintDefault,
  };
}
