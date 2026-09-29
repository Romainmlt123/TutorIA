import { studyBlock } from '@/services/student/studyRules';

import { requireUser, type AuthenticatedUser } from '../auth';
import { consumeSharedLimits, DAY, type SharedLimit } from '../guards/sharedRateLimit';
import { errorResponse } from '../http';
import { serverLog } from '../log';
import type { AdminClient } from '../supabase';

export type TutorFeature = 'chat' | 'voice' | 'image' | 'report';

const MINUTE = 60;

/** Limites par élève, partagées entre toutes les instances du serveur (table rate_limits). */
const LIMITS: Record<TutorFeature, readonly { max: number; windowSeconds: number }[]> = {
  chat: [
    { max: 20, windowSeconds: 10 * MINUTE },
    { max: 150, windowSeconds: DAY },
  ],
  voice: [
    { max: 1, windowSeconds: MINUTE },
    { max: 5, windowSeconds: DAY },
  ],
  image: [
    { max: 3, windowSeconds: 10 * MINUTE },
    { max: 10, windowSeconds: DAY },
  ],
  report: [{ max: 10, windowSeconds: 10 * MINUTE }],
};

export type TutorAccess = { ok: true; user: AuthenticatedUser } | { ok: false; response: Response };

/**
 * Avant tout appel à OpenAI : élève connecté, consentement parental (sous 15 ans),
 * réglages du parent (vocal, caméra, pause du soir, limite du jour) et limite de débit.
 * Le signalement d'une réponse reste possible en toutes circonstances.
 */
export async function requireTutorAccess(
  request: Request,
  admin: AdminClient,
  feature: TutorFeature,
  now = new Date(),
): Promise<TutorAccess> {
  const auth = await requireUser(request, admin);
  if (!auth.ok) return auth;
  if (auth.user.role !== 'student') return { ok: false, response: errorResponse('forbidden') };

  if (feature !== 'report') {
    const { data, error } = await admin.rpc('tutor_context', { p_student_id: auth.user.id });
    const context = data?.[0];
    if (error || !context) {
      if (error) serverLog.error('tutor.context', error);
      return { ok: false, response: errorResponse(error ? 'upstream' : 'unauthorized') };
    }
    if (context.consent_status === 'pending') {
      return { ok: false, response: errorResponse('consent_required') };
    }
    if (
      (feature === 'voice' && !context.voice_enabled) ||
      (feature === 'image' && !context.camera_enabled)
    ) {
      return { ok: false, response: errorResponse('not_allowed') };
    }
    const block = studyBlock(
      {
        eveningPause: context.evening_pause,
        dailyLimitEnabled: context.daily_limit_enabled,
        dailyLimitMinutes: context.daily_limit_minutes,
        allowedFrom: context.allowed_from.slice(0, 5),
        allowedUntil: context.allowed_until.slice(0, 5),
      },
      context.today_seconds,
      now,
    );
    if (block) return { ok: false, response: errorResponse('paused') };
  }

  const limits: SharedLimit[] = LIMITS[feature].map((limit) => ({
    key: `tutor-${feature}-${limit.windowSeconds}:${auth.user.id}`,
    ...limit,
  }));
  const verdict = await consumeSharedLimits(admin, limits);
  if (verdict !== 'allowed') {
    return {
      ok: false,
      response: errorResponse(verdict === 'limited' ? 'rate_limited' : 'upstream'),
    };
  }
  return { ok: true, user: auth.user };
}
