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

  it('donne au tuteur vocal le déroulé d’une leçon, et la séance porte le niveau', async () => {
    const create = jest.fn(async () => ({ value: 'secret', expires_at: 1 }));
    const inserts: Record<string, unknown>[] = [];
    const recording = {
      ...admin,
      from: (table: string) =>
        table === 'study_sessions'
          ? {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    is: () => ({ lt: () => ({ limit: async () => ({ data: [], error: null }) }) }),
                  }),
                }),
              }),
              insert: async (row: Record<string, unknown>) => {
                inserts.push(row);
                return { error: null };
              },
            }
          : (admin.from as (t: string) => unknown)(table),
    } as unknown as AdminClient;
    const request = voiceRequest('maths-equations.isoler-x');
    request.headers.set('X-Client-Id', '0123456789abcdef');
    const response = await handleVoiceSessionStart(request, {
      admin: () => recording,
      realtime: {
        openai: () => ({ realtime: { clientSecrets: { create } } }) as never,
        vocalModel: () => 'vocal',
      },
    });
    expect(response.status).toBe(200);
    const params = (create.mock.calls[0] as unknown as [{ session: { instructions: string } }])[0];
    expect(params.session.instructions).toContain('« Isoler x »');
    expect(params.session.instructions).toContain("tu n'as pas d'outil");
    expect(inserts[0]).toMatchObject({ mode: 'voice', level_id: 'maths-equations.isoler-x' });
  });

  it('donne au tuteur vocal, hors d’Explorer, les visuels autorisés par le parent', async () => {
    const create = jest.fn(async () => ({ value: 'secret', expires_at: 1 }));
    const recording = {
      ...admin,
      from: (table: string) =>
        table === 'study_sessions'
          ? {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    is: () => ({ lt: () => ({ limit: async () => ({ data: [], error: null }) }) }),
                  }),
                }),
              }),
              insert: async () => ({ error: null }),
            }
          : (admin.from as (t: string) => unknown)(table),
    } as unknown as AdminClient;
    let call = 0;
    const start = async (topic: object) => {
      call += 1;
      const request = new Request('http://localhost/api/tutor/realtime-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer good',
          // Une installation par appel : la limite en mémoire n'en permet qu'un par minute.
          'X-Client-Id': `0123456789abcd${String(call).padStart(2, '0')}`,
        },
        body: JSON.stringify({ topic }),
      });
      await handleVoiceSessionStart(request, {
        admin: () => recording,
        realtime: {
          openai: () => ({ realtime: { clientSecrets: { create } } }) as never,
          vocalModel: () => 'vocal',
        },
      });
      return (create.mock.calls.at(-1) as unknown as [{ session: Record<string, unknown> }])[0]
        .session as {
        tools?: { name: string }[];
        instructions: string;
      };
    };
    const free = await start({ subjectId: 'maths' });
    expect(free.tools?.map((t) => t.name)).toEqual([
      'show_graph',
      'write_board',
      'show_chart',
      'draw_figure',
    ]);
    expect(free.instructions).toContain("Visuels pendant l'appel");
    const lesson = await start({
      subjectId: 'maths',
      chapterId: 'maths-equations',
      levelId: 'maths-equations.isoler-x',
    });
    expect(lesson.tools).toBeUndefined();
  });
});
