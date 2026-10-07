import { z } from 'zod';

import type { LevelStore } from './level';
import type { AdminClient } from '../supabase';

/** Réponses enregistrées d'une partie, relues en base (colonne jsonb). */
const answersSchema = z.array(z.object({ correct: z.boolean(), hinted: z.boolean() })).max(20);

/**
 * Parties des niveaux d'Explorer en base : `level_attempts` pour la partie de chaque séance,
 * `finish_level` pour le meilleur résultat et l'XP (une seule fois par partie).
 */
export function supabaseLevelStore(admin: AdminClient): LevelStore {
  return {
    async load(sessionId, studentId, levelId) {
      const { data, error } = await admin
        .from('level_attempts')
        .select('answers, steps_done, finished')
        .eq('session_id', sessionId)
        .eq('student_id', studentId)
        .eq('level_id', levelId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        levelId,
        answers: answersSchema.parse(data.answers),
        stepsDone: data.steps_done,
        finished: data.finished,
      };
    },

    async save(sessionId, studentId, play) {
      const { error } = await admin.from('level_attempts').upsert(
        {
          session_id: sessionId,
          student_id: studentId,
          level_id: play.levelId,
          answers: [...play.answers],
          steps_done: play.stepsDone,
          finished: play.finished,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'session_id,level_id' },
      );
      if (error) throw error;
    },

    async finish(sessionId, studentId, place, outcome) {
      const { data, error } = await admin.rpc('finish_level', {
        p_session_id: sessionId,
        p_student_id: studentId,
        p_level_id: place.level.id,
        p_chapter_id: place.city.id,
        p_subject_id: place.island.subjectId,
        p_level_type: place.level.type,
        p_score: Math.round(outcome.score * 1000) / 1000,
        p_stars: outcome.stars,
        p_passed: outcome.passed,
      });
      if (error) throw error;
      return data;
    },
  };
}
