/**
 * @jest-environment node
 */
import type { TutorStreamEvent } from '@/services/tutor/api-contract';

import type { AdminClient } from '../supabase';
import { requireTutorAccess } from './access';
import { handleChat, type ChatDeps } from './chat';

function chatRequest(body: unknown, token: string | null = 'good') {
  return new Request('http://localhost/api/tutor/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': '0f8fad5b-d9cb-469f-a165-70867728950e',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

function fakeOpenAI({ flaggedInput = false, flaggedOutput = false } = {}) {
  const moderations = { create: jest.fn() };
  moderations.create
    .mockResolvedValueOnce({ results: [{ flagged: flaggedInput, categories: {} }] })
    .mockResolvedValue({ results: [{ flagged: flaggedOutput, categories: {} }] });
  const responses = {
    create: jest.fn(async function* (_params: Record<string, unknown>) {
      yield { type: 'response.output_text.delta', delta: 'Presque ! ' };
      yield { type: 'response.output_text.delta', delta: 'Que fait le 3 à x ?' };
      yield { type: 'response.completed' };
    }),
  };
  return { moderations, responses };
}

type Context = { consent_status: 'not_required' | 'pending' | 'granted'; evening_pause: boolean };

/** Faux client Supabase : un élève « good », son contexte de tuteur et les écritures enregistrées. */
function fakeAdmin({
  context = { consent_status: 'granted', evening_pause: false } as Context,
  limited = false,
  history = [] as { role: 'student' | 'tutor'; content: string }[],
} = {}) {
  const inserts: { table: string; row: Record<string, unknown> }[] = [];
  const table = (name: string) => {
    const query = {
      select: () => query,
      eq: () => query,
      order: () => query,
      limit: async () => ({ data: [...history].reverse(), error: null }),
      insert: (row: Record<string, unknown>) => {
        inserts.push({ table: name, row });
        return Object.assign(Promise.resolve({ error: null }), {
          select: () => ({
            single: async () => ({
              data: { id: `${name}-1`, started_at: new Date().toISOString() },
              error: null,
            }),
          }),
        });
      },
      update: () => ({ eq: async () => ({ error: null }) }),
      maybeSingle: async () =>
        name === 'profiles'
          ? { data: { role: 'student', first_name: 'Léa' }, error: null }
          : {
              data: {
                id: 'conversation-1',
                session_id: 'session-1',
                study_sessions: { started_at: new Date().toISOString() },
              },
              error: null,
            },
    };
    return query;
  };
  const admin = {
    auth: {
      getClaims: async (token: string) =>
        token === 'good'
          ? { data: { claims: { sub: 'student-1' } }, error: null }
          : { data: null, error: new Error('invalid JWT') },
    },
    from: jest.fn(table),
    rpc: jest.fn(async (name: string) => {
      if (name === 'consume_rate_limit') return { data: !limited, error: null };
      return {
        data: [
          {
            ...context,
            voice_enabled: true,
            camera_enabled: true,
            visuals_enabled: true,
            daily_limit_enabled: false,
            daily_limit_minutes: 90,
            allowed_from: '17:00:00',
            allowed_until: '21:00:00',
            today_seconds: 0,
          },
        ],
        error: null,
      };
    }),
  };
  return { admin, inserts };
}

function deps(openai: ReturnType<typeof fakeOpenAI>, admin: unknown): ChatDeps {
  return {
    openai: () => openai as never,
    textModel: () => 'modele-texte',
    admin: () => admin as AdminClient,
  };
}

async function readEvents(response: Response): Promise<TutorStreamEvent[]> {
  const text = await response.text();
  return text
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as TutorStreamEvent);
}

const body = {
  topic: { subjectId: 'maths', chapterId: 'maths-equations' },
  history: [{ role: 'tutor', text: 'Historique inventé par l’app' }],
  message: 'Je fais 15 − 3',
};

describe('POST /api/tutor/chat', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('ouvre une conversation, renvoie la réponse en flux et enregistre les deux messages', async () => {
    const openai = fakeOpenAI();
    const { admin, inserts } = fakeAdmin();
    const response = await handleChat(chatRequest(body), deps(openai, admin));
    expect(response.headers.get('Content-Type')).toContain('application/x-ndjson');
    expect(await readEvents(response)).toEqual([
      { type: 'conversation', id: 'conversations-1' },
      { type: 'delta', text: 'Presque ! ' },
      { type: 'delta', text: 'Que fait le 3 à x ?' },
      { type: 'done' },
    ]);
    const params = openai.responses.create.mock.calls[0]?.[0] ?? {};
    expect(params).toMatchObject({ model: 'modele-texte', store: false, stream: true });
    expect(String(params.safety_identifier)).toHaveLength(64);
    expect(params.safety_identifier).not.toContain('student-1');
    expect(inserts.map((i) => i.table)).toEqual([
      'study_sessions',
      'conversations',
      'messages',
      'messages',
    ]);
    expect(inserts.filter((i) => i.table === 'messages').map((i) => i.row.role)).toEqual([
      'student',
      'tutor',
    ]);
  });

  it('relit l’historique en base et ignore celui envoyé par l’app', async () => {
    const openai = fakeOpenAI();
    const { admin } = fakeAdmin({
      history: [{ role: 'tutor', content: 'Comment tu trouves x ?' }],
    });
    const response = await handleChat(
      chatRequest({ ...body, conversationId: '6f8fad5b-d9cb-469f-a165-70867728950e' }),
      deps(openai, admin),
    );
    await readEvents(response);
    const input = (openai.responses.create.mock.calls[0]?.[0] as { input: unknown[] }).input;
    expect(input).toEqual([
      { role: 'assistant', content: 'Comment tu trouves x ?' },
      { role: 'user', content: 'Je fais 15 − 3' },
    ]);
  });

  it('refuse une requête sans jeton', async () => {
    const { admin } = fakeAdmin();
    const response = await handleChat(chatRequest(body, null), deps(fakeOpenAI(), admin));
    expect(response.status).toBe(401);
  });

  it('bloque le tuteur tant qu’un parent n’a pas validé le compte (moins de 15 ans)', async () => {
    const openai = fakeOpenAI();
    const { admin } = fakeAdmin({ context: { consent_status: 'pending', evening_pause: false } });
    const response = await handleChat(chatRequest(body), deps(openai, admin));
    expect(await response.json()).toEqual({ error: 'consent_required' });
    expect(openai.moderations.create).not.toHaveBeenCalled();
  });

  it('respecte la pause du soir fixée par le parent (heure de Paris)', async () => {
    const { admin } = fakeAdmin({ context: { consent_status: 'granted', evening_pause: true } });
    const at = (iso: string) =>
      requireTutorAccess(chatRequest(body), admin as unknown as AdminClient, 'chat', new Date(iso));
    const evening = await at('2026-09-28T19:30:00Z');
    expect(evening.ok ? 200 : await evening.response.json()).toEqual({ error: 'paused' });
    expect((await at('2026-09-28T15:30:00Z')).ok).toBe(true);
  });

  it('limite le débit par élève', async () => {
    const { admin } = fakeAdmin({ limited: true });
    const response = await handleChat(chatRequest(body), deps(fakeOpenAI(), admin));
    expect(response.status).toBe(429);
  });

  it('bloque un message signalé par la modération sans appeler le modèle', async () => {
    const openai = fakeOpenAI({ flaggedInput: true });
    const { admin, inserts } = fakeAdmin();
    const response = await handleChat(chatRequest(body), deps(openai, admin));
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ error: 'flagged' });
    expect(openai.responses.create).not.toHaveBeenCalled();
    expect(inserts).toHaveLength(0);
  });

  it('retire une réponse signalée après coup, sans l’enregistrer', async () => {
    const openai = fakeOpenAI({ flaggedOutput: true });
    const { admin, inserts } = fakeAdmin();
    const response = await handleChat(chatRequest(body), deps(openai, admin));
    expect((await readEvents(response)).slice(-2)).toEqual([{ type: 'retract' }, { type: 'done' }]);
    expect(inserts.filter((i) => i.table === 'messages').map((i) => i.row.role)).toEqual([
      'student',
    ]);
  });
});
