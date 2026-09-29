import type { SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import { monthIndex, parisDay } from '@/lib/parisTime';

import type { AppSupabaseClient } from '../../supabase/client';
import type {
  ActivityDay,
  FlashcardAnswer,
  MasteryHistory,
  StudentDataService,
  StudentOverview,
  StudyRules,
} from '../StudentDataService';
import type { ChapterProgress } from '../../parents/ParentService';

const DEFAULT_DAILY_MINUTES = 15;

/** Données de l'élève sur Supabase : tout est lu et écrit sous RLS, avec la clé publiable. */
export class SupabaseStudentDataService implements StudentDataService {
  constructor(private readonly supabase: AppSupabaseClient) {}

  private async studentId(): Promise<string> {
    const { data, error } = await this.supabase.auth.getUser();
    if (error || !data.user) throw error ?? new Error('Aucune session');
    return data.user.id;
  }

  async overview(today = new Date()): Promise<StudentOverview> {
    const id = await this.studentId();
    const [progress, todayRow, student, last] = await Promise.all([
      this.supabase
        .from('student_progress')
        .select('xp, streak_days, record_streak')
        .eq('student_id', id)
        .maybeSingle(),
      this.supabase
        .from('daily_activity')
        .select('seconds, sessions')
        .eq('student_id', id)
        .eq('day', parisDay(today))
        .maybeSingle(),
      this.supabase.from('students').select('daily_minutes').eq('id', id).single(),
      // Dernière séance sur un chapitre : c'est elle que « Reprendre » propose.
      this.supabase
        .from('study_sessions')
        .select('chapter_id, subject_id')
        .eq('student_id', id)
        .not('chapter_id', 'is', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    for (const result of [progress, todayRow, student, last]) if (result.error) throw result.error;
    const lastChapterId = last.data?.chapter_id ?? null;
    const chapter = lastChapterId
      ? await this.supabase
          .from('chapter_progress')
          .select('mastery, sessions')
          .eq('student_id', id)
          .eq('chapter_id', lastChapterId)
          .maybeSingle()
      : null;
    if (chapter?.error) throw chapter.error;
    return {
      xp: progress.data?.xp ?? 0,
      streakDays: progress.data?.streak_days ?? 0,
      recordStreak: progress.data?.record_streak ?? 0,
      todayMinutes: Math.round((todayRow.data?.seconds ?? 0) / 60),
      todaySessions: todayRow.data?.sessions ?? 0,
      dailyMinutes: student.data?.daily_minutes ?? DEFAULT_DAILY_MINUTES,
      lastChapter:
        lastChapterId && last.data?.subject_id
          ? {
              chapterId: lastChapterId,
              subjectId: last.data.subject_id,
              mastery: chapter?.data?.mastery ?? null,
              sessions: chapter?.data?.sessions ?? 0,
            }
          : null,
    };
  }

  async activity(fromDay: string): Promise<readonly ActivityDay[]> {
    const { data, error } = await this.supabase
      .from('daily_activity')
      .select('day, seconds, sessions, cards')
      .eq('student_id', await this.studentId())
      .gte('day', fromDay)
      .order('day');
    if (error) throw error;
    return data.map((row) => ({
      day: row.day,
      minutes: Math.round(row.seconds / 60),
      sessions: row.sessions,
      cards: row.cards,
    }));
  }

  async chapters(): Promise<readonly ChapterProgress[]> {
    const { data, error } = await this.supabase
      .from('chapter_progress')
      .select('chapter_id, subject_id, mastery, sessions')
      .eq('student_id', await this.studentId());
    if (error) throw error;
    return data.map((row) => ({
      chapterId: row.chapter_id,
      subjectId: row.subject_id,
      mastery: row.mastery,
      sessions: row.sessions,
    }));
  }

  async masteryHistory(): Promise<MasteryHistory> {
    const { data, error } = await this.supabase
      .from('chapter_progress_monthly')
      .select('month, mastery')
      .eq('student_id', await this.studentId())
      .order('month')
      .limit(500);
    if (error) throw error;
    const byMonth = new Map<string, number[]>();
    for (const row of data) {
      byMonth.set(row.month, [...(byMonth.get(row.month) ?? []), row.mastery]);
    }
    const points = [...byMonth].slice(-8).map(([month, values]) => ({
      label: fr.dates.monthsShort[monthIndex(month)] ?? month,
      percent: Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 100),
    }));
    return { unit: 'month', points };
  }

  async rules(): Promise<StudyRules> {
    const id = await this.studentId();
    const [settings, today] = await Promise.all([
      this.supabase.from('parental_settings').select('*').eq('student_id', id).single(),
      this.supabase
        .from('daily_activity')
        .select('seconds')
        .eq('student_id', id)
        .eq('day', parisDay(new Date()))
        .maybeSingle(),
    ]);
    if (settings.error) throw settings.error;
    if (today.error) throw today.error;
    const s = settings.data;
    return {
      dailyLimitEnabled: s.daily_limit_enabled,
      dailyLimitMinutes: s.daily_limit_minutes,
      allowedFrom: s.allowed_from.slice(0, 5),
      allowedUntil: s.allowed_until.slice(0, 5),
      eveningPause: s.evening_pause,
      voiceEnabled: s.voice_enabled,
      cameraEnabled: s.camera_enabled,
      visualsEnabled: s.visuals_enabled,
      weeklyGoalHours: s.weekly_goal_hours,
      todaySeconds: today.data?.seconds ?? 0,
    };
  }

  async dueCards(today = new Date()): Promise<readonly string[]> {
    const { data, error } = await this.supabase
      .from('flashcard_states')
      .select('card_id')
      .eq('student_id', await this.studentId())
      .lte('due_on', parisDay(today))
      .order('due_on')
      .limit(30);
    if (error) throw error;
    return data.map((row) => row.card_id);
  }

  async startFlashcards(subjectId: SubjectId | null, chapterId: string | null): Promise<string> {
    const { data, error } = await this.supabase
      .from('study_sessions')
      .insert({ mode: 'flashcards', subject_id: subjectId, chapter_id: chapterId })
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  }

  async recordAnswer(sessionId: string, answer: FlashcardAnswer): Promise<void> {
    const { error } = await this.supabase.from('flashcard_reviews').insert({
      session_id: sessionId,
      card_id: answer.cardId,
      chapter_id: answer.chapterId,
      subject_id: answer.subjectId,
      correct: answer.correct,
    });
    if (error) throw error;
  }
}
