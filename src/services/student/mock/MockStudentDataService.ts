import { dailyActivityMinutes, activityStart, masteryHistory } from '@/data/mock/stats';
import { demoChapters, demoSettings } from '@/data/mock/parentSpace';
import { student } from '@/data/mock/student';
import type { SubjectId } from '@/data/types';
import { addDays, parisDay } from '@/lib/parisTime';

import type { ChapterProgress } from '../../parents/ParentService';
import type {
  ActivityDay,
  FlashcardAnswer,
  MasteryHistory,
  StudentDataService,
  StudentOverview,
  StudyRules,
} from '../StudentDataService';

/**
 * Données simulées de Léa (maquettes de l'étape 1) : l'app hors ligne et les tests.
 * Les réponses aux flashcards sont gardées en mémoire, sans effet sur les chiffres affichés.
 */
export class MockStudentDataService implements StudentDataService {
  private counter = 0;
  readonly answers: { sessionId: string; answer: FlashcardAnswer }[] = [];
  /** Compte tout neuf (J1), imposé depuis `/dev/catalogue` : aucune séance, aucune progression. */
  private firstDay = false;

  setFirstDay(on: boolean): void {
    this.firstDay = on;
  }

  async overview(): Promise<StudentOverview> {
    if (this.firstDay) {
      return {
        xp: 0,
        streakDays: 0,
        recordStreak: 0,
        todayMinutes: 0,
        todaySessions: 0,
        dailyMinutes: student.dailyGoal.minutes,
        lastChapter: null,
      };
    }
    return {
      xp: (student.level - 1) * student.xpForNextLevel + student.xp,
      streakDays: student.streakDays,
      recordStreak: student.recordStreakDays,
      todayMinutes: 10,
      todaySessions: student.dailyGoal.sessionsDone,
      dailyMinutes: student.dailyGoal.minutes,
      lastChapter: {
        chapterId: student.resume.chapterId,
        subjectId: student.resume.subjectId,
        mastery: student.resume.chapterProgress,
        sessions: student.resume.lesson - 1,
      },
    };
  }

  async activity(fromDay: string): Promise<readonly ActivityDay[]> {
    const start = parisDay(activityStart);
    return dailyActivityMinutes
      .map((minutes, i) => ({
        day: addDays(start, i),
        minutes,
        sessions: minutes > 0 ? 1 : 0,
        cards: 0,
      }))
      .filter((row) => row.day >= fromDay);
  }

  async chapters(): Promise<readonly ChapterProgress[]> {
    return this.firstDay ? [] : demoChapters;
  }

  async masteryHistory(): Promise<MasteryHistory> {
    return { unit: 'week', points: masteryHistory };
  }

  /** Règles imposées depuis `/dev/catalogue`, pour voir chaque pause sans attendre l'heure. */
  private rulesOverride: Partial<StudyRules> = {};

  setRules(override: Partial<StudyRules>): void {
    this.rulesOverride = override;
  }

  async rules(): Promise<StudyRules> {
    return {
      ...demoSettings,
      dailyLimitEnabled: false,
      eveningPause: false,
      cameraEnabled: true,
      todaySeconds: 600,
      ...this.rulesOverride,
    };
  }

  async dueCards(): Promise<readonly string[]> {
    return [];
  }

  async startFlashcards(_subjectId: SubjectId | null, _chapterId: string | null): Promise<string> {
    this.counter += 1;
    return `mock-session-${this.counter}`;
  }

  async recordAnswer(sessionId: string, answer: FlashcardAnswer): Promise<void> {
    this.answers.push({ sessionId, answer });
  }
}
