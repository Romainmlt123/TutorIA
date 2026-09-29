import type {
  ComfortLevel,
  DailyMinutes,
  OnboardingAnswers,
  StudyMoment,
  SubjectId,
} from '@/data/types';

/** Les quatre étapes de l'onboarding (O1 à O4), chacune peut être passée. */
export const ONBOARDING_STEPS = ['classe', 'matieres', 'objectifs', 'style'] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const DAILY_MINUTES: readonly DailyMinutes[] = [10, 15, 20, 30];
export const DEFAULT_DAILY_MINUTES: DailyMinutes = 15;

export const EMPTY_ANSWERS: OnboardingAnswers = {
  grade: null,
  selfAssessment: {},
  goals: [],
  dailyMinutes: null,
  modes: [],
  moments: [],
  reminder: false,
};

/** Numéro affiché dans « Étape n sur 4 ». */
export function stepNumber(step: OnboardingStep): number {
  return ONBOARDING_STEPS.indexOf(step) + 1;
}

/** Étape suivante, ou `pret` (O5) après la dernière. */
export function nextStep(step: OnboardingStep): OnboardingStep | 'pret' {
  return ONBOARDING_STEPS[ONBOARDING_STEPS.indexOf(step) + 1] ?? 'pret';
}

/** Champs enregistrés par chaque étape. */
const STEP_FIELDS: Record<OnboardingStep, readonly (keyof OnboardingAnswers)[]> = {
  classe: ['grade'],
  matieres: ['selfAssessment'],
  objectifs: ['goals', 'dailyMinutes'],
  style: ['modes', 'moments', 'reminder'],
};

/**
 * « Passer » : l'étape n'enregistre rien, même si l'élève avait commencé à répondre.
 * Les réponses des autres étapes sont gardées.
 */
export function skipStep(answers: OnboardingAnswers, step: OnboardingStep): OnboardingAnswers {
  const reset: Partial<OnboardingAnswers> = {};
  for (const field of STEP_FIELDS[step]) Object.assign(reset, { [field]: EMPTY_ANSWERS[field] });
  return { ...answers, ...reset };
}

/** Ajoute ou retire une valeur d'un choix multiple (objectifs, façons d'apprendre, moments). */
export function toggleValue<T>(values: readonly T[], value: T): T[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

// ---------------------------------------------------------------------------
// Plan de O5
// ---------------------------------------------------------------------------

const COMFORT_ORDER: readonly ComfortLevel[] = ['struggling', 'meh', 'ok', 'confident'];

/** Départage à niveau égal : ordre pédagogique fixe, des matières les plus structurantes aux autres. */
export const PLAN_SUBJECT_ORDER: readonly SubjectId[] = [
  'maths',
  'francais',
  'anglais',
  'physique-chimie',
  'svt',
  'histoire-geo',
];

export type PlanStep = { subjectId: SubjectId; level: ComfortLevel | null };

/**
 * Plan personnalisé : il commence par la matière la moins à l'aise.
 * À niveau égal, l'ordre pédagogique départage ; les matières non évaluées viennent en dernier.
 */
export function buildStudyPlan(
  selfAssessment: OnboardingAnswers['selfAssessment'],
  steps = 2,
): PlanStep[] {
  const rank = (subjectId: SubjectId) => {
    const level = selfAssessment[subjectId];
    return level === undefined ? COMFORT_ORDER.length : COMFORT_ORDER.indexOf(level);
  };
  return [...PLAN_SUBJECT_ORDER]
    .sort(
      (a, b) => rank(a) - rank(b) || PLAN_SUBJECT_ORDER.indexOf(a) - PLAN_SUBJECT_ORDER.indexOf(b),
    )
    .slice(0, steps)
    .map((subjectId) => ({ subjectId, level: selfAssessment[subjectId] ?? null }));
}

const MOMENT_ORDER: readonly StudyMoment[] = ['after_school', 'evening', 'morning', 'weekend'];

/** Moment de révision affiché dans le plan : le premier choisi, dans l'ordre de la journée scolaire. */
export function preferredMoment(moments: readonly StudyMoment[]): StudyMoment | null {
  return MOMENT_ORDER.find((moment) => moments.includes(moment)) ?? null;
}
