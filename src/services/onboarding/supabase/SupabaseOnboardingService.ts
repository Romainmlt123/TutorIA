import type { ComfortLevel, OnboardingAnswers, SubjectId } from '@/data/types';

import type { AuthService } from '../../auth/AuthService';
import type { AppSupabaseClient } from '../../supabase/client';
import type { OnboardingService } from '../OnboardingService';

const DAILY_MINUTES = [10, 15, 20, 30] as const;

/** Onboarding sur Supabase : colonnes de `students` et table `self_assessments`, sous RLS. */
export class SupabaseOnboardingService implements OnboardingService {
  constructor(
    private readonly supabase: AppSupabaseClient,
    private readonly auth: AuthService,
  ) {}

  private async studentId(): Promise<string> {
    const { data, error } = await this.supabase.auth.getUser();
    if (error || !data.user) throw error ?? new Error('Aucune session');
    return data.user.id;
  }

  async load(): Promise<OnboardingAnswers> {
    const id = await this.studentId();
    const [student, levels] = await Promise.all([
      this.supabase
        .from('students')
        .select('grade, daily_minutes, goals, modes, moments, reminder_enabled')
        .eq('id', id)
        .single(),
      this.supabase.from('self_assessments').select('subject_id, level').eq('student_id', id),
    ]);
    if (student.error) throw student.error;
    if (levels.error) throw levels.error;
    const minutes = DAILY_MINUTES.find((m) => m === student.data.daily_minutes) ?? null;
    return {
      grade: student.data.grade,
      selfAssessment: Object.fromEntries(
        levels.data.map((row) => [row.subject_id, row.level]),
      ) as Partial<Record<SubjectId, ComfortLevel>>,
      goals: student.data.goals,
      dailyMinutes: minutes,
      modes: student.data.modes,
      moments: student.data.moments,
      reminder: student.data.reminder_enabled,
    };
  }

  async save(answers: OnboardingAnswers): Promise<void> {
    const id = await this.studentId();
    const { error } = await this.supabase
      .from('students')
      .update({
        grade: answers.grade,
        daily_minutes: answers.dailyMinutes,
        goals: [...answers.goals],
        modes: [...answers.modes],
        moments: [...answers.moments],
        reminder_enabled: answers.reminder,
      })
      .eq('id', id);
    if (error) throw error;

    const rows = Object.entries(answers.selfAssessment).map(([subject, level]) => ({
      student_id: id,
      subject_id: subject as SubjectId,
      level: level as ComfortLevel,
    }));
    const kept = rows.map((row) => row.subject_id);
    const removal = this.supabase.from('self_assessments').delete().eq('student_id', id);
    const { error: deleteError } = kept.length
      ? await removal.not('subject_id', 'in', `(${kept.join(',')})`)
      : await removal;
    if (deleteError) throw deleteError;
    if (rows.length) {
      const { error: upsertError } = await this.supabase.from('self_assessments').upsert(rows);
      if (upsertError) throw upsertError;
    }
  }

  async complete(answers: OnboardingAnswers): Promise<void> {
    await this.save(answers);
    const id = await this.studentId();
    const { error } = await this.supabase
      .from('students')
      .update({ onboarding_completed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    await this.auth.refreshAccount();
  }
}
