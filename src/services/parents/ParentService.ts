import type { SubjectId } from '@/data/types';

/** Statut d'un chapitre pour un parent (P2), plus lisible qu'un pourcentage brut. */
export type ChapterStatus = 'acquired' | 'inProgress' | 'toConsolidate' | 'notStarted';

/** Résultat d'une séance (P3). */
export type SessionOutcome = 'understood' | 'progressing' | 'toReview';

export type SessionMode = 'written' | 'voice' | 'flashcards';

/** Outils visuels utilisés pendant une séance écrite ou vocale (graphique, tableau blanc). */
export type SessionTool = 'graph' | 'whiteboard';

export type DayActivity = { date: string; minutes: number };

/** Chapitre travaillé ou non, avec sa maîtrise (0 à 1) et son nombre de séances. */
export type ChapterProgress = {
  chapterId: string;
  subjectId: SubjectId;
  mastery: number | null;
  sessions: number;
};

/** Semaine de l'enfant (P1), à partir des agrégats quotidiens. */
export type ParentWeek = {
  /** Lundi de la semaine, AAAA-MM-JJ (heure de Paris). */
  weekStart: string;
  days: readonly DayActivity[];
  previousMinutes: number;
  previousActiveDays: number;
  /** Chapitres passés « acquis » pendant la semaine. */
  acquiredThisWeek: readonly string[];
  /** Minutes par matière sur la semaine. */
  minutesBySubject: Partial<Record<SubjectId, number>>;
  /** Heure (0 à 23) de début des séances de la semaine, pour la note du graphique. */
  sessionHours: readonly number[];
  /** Résumé rédigé par le tuteur à partir des agrégats (sans prénom), ou null. */
  aiSummary: { text: string; generatedAt: string } | null;
};

export type ParentSession = {
  id: string;
  subjectId: SubjectId;
  chapterId: string | null;
  startedAt: string;
  durationMinutes: number;
  mode: SessionMode;
  tools: readonly SessionTool[];
  outcome: SessionOutcome;
  /** Résumé à afficher, jamais la transcription. */
  summary: string;
};

export type ParentalSettings = {
  dailyLimitEnabled: boolean;
  dailyLimitMinutes: number;
  allowedFrom: string;
  allowedUntil: string;
  eveningPause: boolean;
  voiceEnabled: boolean;
  cameraEnabled: boolean;
  visualsEnabled: boolean;
  weeklyGoalHours: number;
};

export type ParentNotifications = { weeklyReport: boolean; alerts: boolean };

export type ProgressPeriod = 'month' | 'quarter';

export type ChildProgress = {
  chapters: readonly ChapterProgress[];
  /** Maîtrise des chapitres en début de période, pour l'évolution. */
  previousMastery: Partial<Record<string, number>>;
};

/** Données de l'espace Parents pour un enfant relié. Jamais les messages de l'enfant. */
export interface ParentService {
  week(studentId: string, today?: Date): Promise<ParentWeek>;
  progress(studentId: string, period: ProgressPeriod, today?: Date): Promise<ChildProgress>;
  sessions(studentId: string, today?: Date): Promise<readonly ParentSession[]>;
  settings(studentId: string): Promise<ParentalSettings>;
  updateSettings(studentId: string, patch: Partial<ParentalSettings>): Promise<ParentalSettings>;
  notifications(): Promise<ParentNotifications>;
  updateNotifications(patch: Partial<ParentNotifications>): Promise<ParentNotifications>;
}
