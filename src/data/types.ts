import type { SubjectId } from '@/theme';

export type { SubjectId };

export type Subject = {
  id: SubjectId;
  name: string;
  /** Maîtrise moyenne des chapitres travaillés, de 0 à 1. */
  mastery: number;
};

export type Chapter = {
  id: string;
  subjectId: SubjectId;
  title: string;
};

export type AnswerIndex = 0 | 1 | 2 | 3;

/** Flashcard QCM : une question, 4 réponses dont une bonne, une explication bienveillante. */
export type Flashcard = {
  id: string;
  chapterId: string;
  question: string;
  options: readonly [string, string, string, string];
  answerIndex: AnswerIndex;
  /** Explication courte de la bonne réponse, affichée après la réponse. */
  explanation: string;
};

export type UserRole = 'student' | 'parent';

/** Classe, du CP à la Terminale (libellés affichés tels quels). */
export type Grade =
  'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2' | '6e' | '5e' | '4e' | '3e' | '2de' | '1re' | 'Tle';

/** Auto-évaluation de l'onboarding (Galère, Bof, Ça va, À l'aise) : jamais une note. */
export type ComfortLevel = 'struggling' | 'meh' | 'ok' | 'confident';

export type LearningGoal =
  | 'raise_grades'
  | 'understand'
  | 'prepare_tests'
  | 'national_exam'
  | 'get_ahead'
  | 'homework_faster';

/** Façons d'apprendre, qui correspondent aux modes de l'app. */
export type LearningMode = 'written' | 'voice' | 'visual' | 'quiz';

export type StudyMoment = 'morning' | 'after_school' | 'evening' | 'weekend';

export type DailyMinutes = 10 | 15 | 20 | 30;

/** Réponses de l'onboarding (O1 à O4). Chaque étape peut être passée : tout est facultatif. */
export type OnboardingAnswers = {
  grade: Grade | null;
  selfAssessment: Partial<Record<SubjectId, ComfortLevel>>;
  goals: readonly LearningGoal[];
  dailyMinutes: DailyMinutes | null;
  modes: readonly LearningMode[];
  moments: readonly StudyMoment[];
  reminder: boolean;
};

/** not_required : 15 ans ou plus. pending : en attente d'un parent. granted : validé. */
export type ConsentStatus = 'not_required' | 'pending' | 'granted';

export type StudentProfile = {
  firstName: string;
  grade: Grade;
  streakDays: number;
  recordStreakDays: number;
  level: number;
  xp: number;
  xpForNextLevel: number;
  unreadNotifications: number;
  dailyGoal: { minutes: number; sessionsDone: number; sessionsTarget: number };
  /** Dernière leçon en cours, proposée dans la carte « Reprendre ». */
  resume: {
    subjectId: SubjectId;
    chapterId: string;
    lesson: number;
    lessonCount: number;
    lessonTitle: string;
    chapterProgress: number;
  };
};

export type Quote = { text: string; author: string };

export type PeriodKey = 'week' | 'month' | 'quarter';

export type Comparable = { current: number; previous: number };

export type PeriodStats = {
  studyMinutes: Comparable;
  sessions: Comparable;
  cardsReviewed: Comparable;
  /** Temps d'étude par jour, semaine ou mois, en minutes. */
  series: readonly { label: string; minutes: number }[];
};

export type Insight = { notion: string; chapterId: string; score: number };

export type MasteryPoint = { label: string; percent: number };

export type ChatRole = 'tutor' | 'student';
