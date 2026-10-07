import type { LevelRecord, Stars } from '@/features/explorer/logic/progression';

import type { AppSupabaseClient } from '../../supabase/client';
import type { ExplorerService } from '../ExplorerService';

/** Progression lue en base (`level_progress`, sous RLS) : le serveur seul l'écrit, en fin de niveau. */
export class SupabaseExplorerService implements ExplorerService {
  constructor(private readonly supabase: AppSupabaseClient) {}

  async levelRecords(): Promise<readonly LevelRecord[]> {
    const { data: auth, error: authError } = await this.supabase.auth.getUser();
    if (authError || !auth.user) throw authError ?? new Error('Aucune session');
    const { data, error } = await this.supabase
      .from('level_progress')
      .select('level_id, best_score, stars, attempts, last_played_at')
      .eq('student_id', auth.user.id);
    if (error) throw error;
    return data.map((row) => ({
      levelId: row.level_id,
      finished: true,
      bestScore: row.best_score,
      stars: Math.min(3, Math.max(0, row.stars)) as Stars,
      attempts: row.attempts,
      lastPlayedAt: row.last_played_at,
    }));
  }
}
