/**
 * @jest-environment node
 */
import type { AdminClient } from '../supabase';
import { handleVoiceSessionStart } from './voice';

function voiceRequest(levelId: string) {
  return new Request('http://localhost/api/tutor/realtime-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer good' },
    body: JSON.stringify({ topic: { subjectId: 'maths', chapterId: 'maths-equations', levelId } }),
  });
}

/** Élève autorisé, vocal activé par le parent, en dehors de toute pause. */
const admin = {
  auth: { getClaims: async () => ({ data: { claims: { sub: 'student-1' } }, error: null }) },
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: { role: 'student', first_name: 'Léa' }, error: null }),
      }),
    }),
  }),
  rpc: async (name: string) =>
    name === 'consume_rate_limit'
      ? { data: true, error: null }
      : {
          data: [
            {
              consent_status: 'granted',
              voice_enabled: true,
              camera_enabled: true,
              visuals_enabled: true,
              evening_pause: false,
              daily_limit_enabled: false,
              daily_limit_minutes: 90,
              allowed_from: '00:00:00',
              allowed_until: '23:59:00',
              today_seconds: 0,
            },
          ],
          error: null,
        },
} as unknown as AdminClient;

describe('POST /api/tutor/realtime-session · niveaux d’Explorer', () => {
  it.each(['maths-equations.resoudre-ax-b-c', 'maths-equations.bilan'])(
    'refuse à la voix les exercices notés et les évaluations (%s)',
    async (levelId) => {
      const response = await handleVoiceSessionStart(voiceRequest(levelId), { admin: () => admin });
      expect(await response.json()).toEqual({ error: 'not_allowed' });
    },
  );
});
