import type { MasteryPoint, SubjectId } from '@/data/types';

import type { ChapterProgress, ParentalSettings } from '../parents/ParentService';

export type StudentOverview = {
  /** XP cumulés depuis l'inscription. */
  xp: number;
  streakDays: number;
  recordStreak: number;
  todayMinutes: number;
  todaySessions: number;
  /** Temps par jour choisi pendant l'onboarding (O3). */
  dailyMinutes: number;
  /** Dernier chapitre travaillé, pour la carte « Reprendre ». */
  lastChapter: {
    chapterId: string;
    subjectId: SubjectId;
    mastery: number | null;
    sessions: number;
  } | null;
};

export type MasteryHistory = { unit: 'week' | 'month'; points: readonly MasteryPoint[] };

export type ActivityDay = { day: string; minutes: number; sessions: number; cards: number };

/** Réglages parentaux appliqués côté élève, avec le temps déjà passé aujourd'hui. */
export type StudyRules = ParentalSettings & { todaySeconds: number };

export type FlashcardAnswer = {
  cardId: string;
  chapterId: string;
  subjectId: SubjectId;
  correct: boolean;
};

/**
 * Données de l'élève connecté : lectures sous RLS, et réponses aux flashcards
 * (la base calcule elle-même XP, série, maîtrise et temps d'étude).
 */
export interface StudentDataService {
  overview(today?: Date): Promise<StudentOverview>;
  activity(fromDay: string): Promise<readonly ActivityDay[]>;
  chapters(): Promise<readonly ChapterProgress[]>;
  /** Évolution de la maîtrise globale (« Évolution de ta maîtrise ») et l'unité des mesures. */
  masteryHistory(): Promise<MasteryHistory>;
  rules(): Promise<StudyRules>;
  /** Cartes à revoir aujourd'hui (répétition espacée). */
  dueCards(today?: Date): Promise<readonly string[]>;
  startFlashcards(subjectId: SubjectId | null, chapterId: string | null): Promise<string>;
  recordAnswer(sessionId: string, answer: FlashcardAnswer): Promise<void>;
}
