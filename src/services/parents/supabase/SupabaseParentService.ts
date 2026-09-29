import { chapterTitle, chaptersOfSubject } from '@/data/curriculum';
import type { SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import { addDays, parisDay, parisTime } from '@/lib/parisTime';

import { logError } from '@/lib/logger';

import { callAccountApi } from '../../auth/accountApi';
import type { AuthService } from '../../auth/AuthService';
import type { Database } from '../../db/database.types';
import type { AppSupabaseClient } from '../../supabase/client';
import type {
  ChapterProgress,
  ChildProgress,
  ParentalSettings,
  ParentNotifications,
  ParentService,
  ParentSession,
  ParentWeek,
  ProgressPeriod,
  SessionOutcome,
} from '../ParentService';

type SessionRow = Database['public']['Tables']['study_sessions']['Row'];
type SettingsRow = Database['public']['Tables']['parental_settings']['Row'];

const SUBJECTS: readonly SubjectId[] = [
  'maths',
  'francais',
  'histoire-geo',
  'anglais',
  'svt',
  'physique-chimie',
];

const clock = (time: string) => time.slice(0, 5);

function toSettings(row: SettingsRow): ParentalSettings {
  return {
    dailyLimitEnabled: row.daily_limit_enabled,
    dailyLimitMinutes: row.daily_limit_minutes,
    allowedFrom: clock(row.allowed_from),
    allowedUntil: clock(row.allowed_until),
    eveningPause: row.evening_pause,
    voiceEnabled: row.voice_enabled,
    cameraEnabled: row.camera_enabled,
    visualsEnabled: row.visuals_enabled,
    weeklyGoalHours: row.weekly_goal_hours,
  };
}

function outcomeOf(row: SessionRow): SessionOutcome {
  if (row.mode === 'flashcards') {
    const rate = row.cards_answered ? row.cards_correct / row.cards_answered : 0;
    return rate >= 0.8 ? 'understood' : rate >= 0.5 ? 'progressing' : 'toReview';
  }
  if (row.outcome === 'to_review') return 'toReview';
  return row.outcome ?? 'progressing';
}

/** Résumé affiché au parent : gabarit à partir des champs structurés, jamais la conversation. */
function summaryOf(row: SessionRow): string {
  const t = fr.parent.sessions.summaries;
  if (row.mode === 'flashcards') return t.flashcards(row.cards_answered, row.cards_correct);
  if (row.mode === 'voice') {
    return row.chapter_id ? t.voice(chapterTitle(row.chapter_id)) : t.voiceNoChapter;
  }
  return t.written(row.summary_understood, row.summary_to_review);
}

/** Premier jour d'un mois décalé : '2026-09-28', -1 → '2026-08-01'. */
function monthStart(day: string, offset: number): string {
  const date = new Date(`${day.slice(0, 7)}-01T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 10);
}

/** Espace Parents sur Supabase : lectures sous RLS (enfants reliés), jamais les messages. */
export class SupabaseParentService implements ParentService {
  constructor(
    private readonly supabase: AppSupabaseClient,
    private readonly auth: AuthService,
  ) {}

  /** Résumé de la semaine rédigé à la demande (une fois par jour et par enfant), sinon rien. */
  private async requestWeeklyReport(studentId: string): Promise<ParentWeek['aiSummary']> {
    try {
      const report = await callAccountApi<{ summary: string | null; generated_at?: string }>(
        '/api/parents/weekly-report',
        await this.auth.getAccessToken(),
        { body: { studentId } },
      );
      return report.summary && report.generated_at
        ? { text: report.summary, generatedAt: report.generated_at }
        : null;
    } catch (error) {
      logError('parents.weeklyReport', error);
      return null;
    }
  }

  /** Séances écrites terminées sans résumé : le serveur les résume une fois (3 au plus par ouverture). */
  private async summarizePending(rows: readonly SessionRow[]): Promise<boolean> {
    const quietSince = Date.now() - 5 * 60_000;
    const pending = rows
      .filter(
        (row) =>
          row.mode === 'written' &&
          row.outcome === null &&
          Date.parse(row.ended_at ?? row.started_at) < quietSince,
      )
      .slice(0, 3);
    if (pending.length === 0) return false;
    const token = await this.auth.getAccessToken();
    const results = await Promise.allSettled(
      pending.map((row) =>
        callAccountApi('/api/tutor/session/summary', token, { body: { sessionId: row.id } }),
      ),
    );
    for (const result of results) {
      if (result.status === 'rejected') logError('parents.sessionSummary', result.reason);
    }
    return true;
  }

  private async sessionsSince(studentId: string, fromDay: string): Promise<SessionRow[]> {
    // Marge d'un jour : le filtre exact se fait ensuite sur le jour de Paris.
    const { data, error } = await this.supabase
      .from('study_sessions')
      .select('*')
      .eq('student_id', studentId)
      .gte('started_at', `${addDays(fromDay, -1)}T00:00:00Z`)
      .order('started_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    return data.filter((row) => parisDay(new Date(row.started_at)) >= fromDay);
  }

  async week(studentId: string, today = new Date()): Promise<ParentWeek> {
    const end = parisDay(today);
    const start = addDays(end, -6);
    const previousStart = addDays(start, -7);
    const [activity, sessions, acquired, report] = await Promise.all([
      this.supabase
        .from('daily_activity')
        .select('day, seconds')
        .eq('student_id', studentId)
        .gte('day', previousStart)
        .lte('day', end),
      this.sessionsSince(studentId, start),
      this.supabase
        .from('chapter_progress')
        .select('chapter_id')
        .eq('student_id', studentId)
        .gte('mastery', 0.8)
        .gte('updated_at', `${start}T00:00:00Z`),
      this.supabase
        .from('weekly_reports')
        .select('summary, generated_at')
        .eq('student_id', studentId)
        .eq('week_start', start)
        .maybeSingle(),
    ]);
    if (activity.error) throw activity.error;
    if (acquired.error) throw acquired.error;
    if (report.error) throw report.error;

    const minutesOn = (day: string) =>
      Math.round((activity.data.find((row) => row.day === day)?.seconds ?? 0) / 60);
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i);
      return { date, minutes: minutesOn(date) };
    });
    const previous = Array.from({ length: 7 }, (_, i) => minutesOn(addDays(previousStart, i)));
    const minutesBySubject: ParentWeek['minutesBySubject'] = {};
    for (const row of sessions) {
      if (!row.subject_id) continue;
      minutesBySubject[row.subject_id] =
        (minutesBySubject[row.subject_id] ?? 0) + Math.round(row.duration_seconds / 60);
    }
    return {
      weekStart: start,
      days,
      previousMinutes: previous.reduce((sum, m) => sum + m, 0),
      previousActiveDays: previous.filter((m) => m > 0).length,
      acquiredThisWeek: acquired.data.map((row) => row.chapter_id),
      minutesBySubject,
      sessionHours: sessions.map((row) => parisTime(new Date(row.started_at)).hour),
      aiSummary: report.data
        ? { text: report.data.summary, generatedAt: report.data.generated_at }
        : days.some((d) => d.minutes > 0)
          ? await this.requestWeeklyReport(studentId)
          : null,
    };
  }

  async progress(
    studentId: string,
    period: ProgressPeriod,
    today = new Date(),
  ): Promise<ChildProgress> {
    const snapshotMonth = monthStart(parisDay(today), period === 'month' ? -1 : -3);
    const [rows, snapshots] = await Promise.all([
      this.supabase
        .from('chapter_progress')
        .select('chapter_id, subject_id, mastery, sessions')
        .eq('student_id', studentId),
      this.supabase
        .from('chapter_progress_monthly')
        .select('chapter_id, mastery')
        .eq('student_id', studentId)
        .eq('month', snapshotMonth),
    ]);
    if (rows.error) throw rows.error;
    if (snapshots.error) throw snapshots.error;
    const byChapter = new Map(rows.data.map((row) => [row.chapter_id, row]));
    // Tous les chapitres du programme, travaillés ou non (« Pas commencé »).
    const chapters: ChapterProgress[] = SUBJECTS.flatMap((subjectId) =>
      chaptersOfSubject(subjectId).map((chapter) => {
        const row = byChapter.get(chapter.id);
        return {
          chapterId: chapter.id,
          subjectId,
          mastery: row?.mastery ?? null,
          sessions: row?.sessions ?? 0,
        };
      }),
    );
    return {
      chapters,
      previousMastery: Object.fromEntries(
        snapshots.data.map((row) => [row.chapter_id, row.mastery]),
      ),
    };
  }

  async sessions(studentId: string, today = new Date()): Promise<readonly ParentSession[]> {
    const from = addDays(parisDay(today), -6);
    let rows = await this.sessionsSince(studentId, from);
    if (await this.summarizePending(rows)) rows = await this.sessionsSince(studentId, from);
    return rows
      .filter((row) => row.subject_id !== null)
      .map((row) => ({
        id: row.id,
        subjectId: row.subject_id as SubjectId,
        chapterId: row.chapter_id,
        startedAt: row.started_at,
        durationMinutes: Math.max(1, Math.round(row.duration_seconds / 60)),
        mode: row.mode,
        tools: row.tools,
        outcome: outcomeOf(row),
        summary: summaryOf(row),
      }));
  }

  async settings(studentId: string): Promise<ParentalSettings> {
    const { data, error } = await this.supabase
      .from('parental_settings')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error) throw error;
    return toSettings(data);
  }

  async updateSettings(
    studentId: string,
    patch: Partial<ParentalSettings>,
  ): Promise<ParentalSettings> {
    const { data, error } = await this.supabase
      .from('parental_settings')
      .update({
        daily_limit_enabled: patch.dailyLimitEnabled,
        daily_limit_minutes: patch.dailyLimitMinutes,
        allowed_from: patch.allowedFrom,
        allowed_until: patch.allowedUntil,
        evening_pause: patch.eveningPause,
        voice_enabled: patch.voiceEnabled,
        camera_enabled: patch.cameraEnabled,
        visuals_enabled: patch.visualsEnabled,
        weekly_goal_hours: patch.weeklyGoalHours,
      })
      .eq('student_id', studentId)
      .select('*')
      .single();
    if (error) throw error;
    return toSettings(data);
  }

  private async parentId(): Promise<string> {
    const { data, error } = await this.supabase.auth.getUser();
    if (error || !data.user) throw error ?? new Error('Aucune session');
    return data.user.id;
  }

  async notifications(): Promise<ParentNotifications> {
    const { data, error } = await this.supabase
      .from('parents')
      .select('weekly_report, alerts')
      .eq('id', await this.parentId())
      .single();
    if (error) throw error;
    return { weeklyReport: data.weekly_report, alerts: data.alerts };
  }

  async updateNotifications(patch: Partial<ParentNotifications>): Promise<ParentNotifications> {
    const { data, error } = await this.supabase
      .from('parents')
      .update({ weekly_report: patch.weeklyReport, alerts: patch.alerts })
      .eq('id', await this.parentId())
      .select('weekly_report, alerts')
      .single();
    if (error) throw error;
    return { weeklyReport: data.weekly_report, alerts: data.alerts };
  }
}
