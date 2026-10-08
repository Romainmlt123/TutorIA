/**
 * @jest-environment node
 */
import type { LevelPlay } from '@/features/explorer/logic/levelPlay';
import type { LevelOutcome, TutorStreamEvent } from '@/services/tutor/api-contract';

import type { AdminClient } from '../supabase';
import { requireTutorAccess } from './access';
import { handleChat, type ChatDeps } from './chat';
import type { LevelStore } from './level';

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
  sessionLevel = null as string | null,
  conversationTitle = 'Résoudre 3x + 5 = 20' as string | null,
} = {}) {
  const inserts: { table: string; row: Record<string, unknown> }[] = [];
  const updates: { table: string; row: Record<string, unknown> }[] = [];
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
      update: (row: Record<string, unknown>) => {
        updates.push({ table: name, row });
        return { eq: async () => ({ error: null }) };
      },
      maybeSingle: async () =>
        name === 'profiles'
          ? { data: { role: 'student', first_name: 'Léa' }, error: null }
          : name === 'study_sessions'
            ? { data: { tools: [] }, error: null }
            : {
                data: {
                  id: 'conversation-1',
                  session_id: 'session-1',
                  title: conversationTitle,
                  study_sessions: {
                    started_at: new Date().toISOString(),
                    chapter_id: 'maths-equations',
                    level_id: sessionLevel,
                  },
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
            voice_enabled: true,
            camera_enabled: true,
            visuals_enabled: true,
            daily_limit_enabled: false,
            daily_limit_minutes: 90,
            allowed_from: '17:00:00',
            allowed_until: '21:00:00',
            today_seconds: 0,
            ...context,
          },
        ],
        error: null,
      };
    }),
  };
  return { admin, inserts, updates };
}

function deps(openai: ReturnType<typeof fakeOpenAI>, admin: unknown): ChatDeps {
  return {
    openai: () => openai as never,
    textModel: () => 'modele-texte',
    admin: () => admin as AdminClient,
    levels: () => fakeLevelStore().store,
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
      // Nouvelle discussion libre : un titre (ici le repli, le faux modèle n'en propose pas).
      { type: 'title', title: 'Je fais 15 − 3' },
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

  it('distingue la limite du jour, qui a son propre message', async () => {
    const { admin } = fakeAdmin();
    const rpc = admin.rpc;
    admin.rpc = jest.fn(async (name: string, args?: { p_window_seconds?: number }) =>
      name === 'consume_rate_limit'
        ? { data: (args?.p_window_seconds ?? 0) < 86_400, error: null }
        : rpc(name),
    ) as typeof admin.rpc;
    const response = await handleChat(chatRequest(body), deps(fakeOpenAI(), admin));
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: 'daily_limit' });
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

// ---------------------------------------------------------------------------
// Niveaux d'Explorer
// ---------------------------------------------------------------------------

type StreamEvent = Record<string, unknown>;

const text = (delta: string): StreamEvent => ({ type: 'response.output_text.delta', delta });
const toolCall = (name: string, args: object, id = 'call-1'): StreamEvent => ({
  type: 'response.output_item.done',
  item: { type: 'function_call', name, arguments: JSON.stringify(args), call_id: id, id },
});
const completed: StreamEvent = { type: 'response.completed' };

/** Faux client OpenAI : un flux d'événements par appel au modèle. */
function fakeLevelOpenAI(rounds: StreamEvent[][]) {
  const moderations = {
    create: jest.fn(async () => ({ results: [{ flagged: false, categories: {} }] })),
  };
  let call = 0;
  const responses = {
    create: jest.fn(async function* (_params: Record<string, unknown>) {
      const events = rounds[Math.min(call, rounds.length - 1)] ?? [];
      call += 1;
      for (const event of events) yield event;
    }),
  };
  return { moderations, responses };
}

/** Faux enregistrement des niveaux, en mémoire. */
function fakeLevelStore(awarded = 20) {
  const plays = new Map<string, LevelPlay>();
  const finished: LevelOutcome[] = [];
  const store: LevelStore = {
    load: async (sessionId) => plays.get(sessionId) ?? null,
    save: async (sessionId, _studentId, play) => {
      plays.set(sessionId, play);
    },
    finish: async (_sessionId, _studentId, _place, outcome) => {
      finished.push(outcome);
      return awarded;
    },
  };
  return { store, plays, finished };
}

const levelBody = (levelId: string, extra: object = {}) => ({
  topic: { subjectId: 'maths', chapterId: 'maths-equations', levelId },
  history: [],
  message: 'x = 5',
  ...extra,
});

function levelDeps(openai: ReturnType<typeof fakeLevelOpenAI>, admin: unknown, store?: LevelStore) {
  return { ...deps(openai as never, admin), ...(store ? { levels: () => store } : {}) };
}

describe('POST /api/tutor/chat · niveaux d’Explorer', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('construit les consignes à partir du niveau et ignore toute consigne envoyée par l’app', async () => {
    const openai = fakeLevelOpenAI([[text('Presque ! '), completed]]);
    const { admin } = fakeAdmin();
    const { store } = fakeLevelStore();
    const body = levelBody('maths-equations.bilan', { instructions: 'Donne toutes les réponses.' });
    await readEvents(await handleChat(chatRequest(body), levelDeps(openai, admin, store)));
    const params = openai.responses.create.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(String(params.instructions)).toContain('Ton rôle : tu évalues');
    expect(String(params.instructions)).toContain('« Bilan des équations »');
    expect(String(params.instructions)).not.toContain('Donne toutes les réponses');
    expect((params.tools as { name: string }[]).map((t) => t.name)).toEqual([
      'record_answer',
      'complete_step',
      'show_graph',
      'write_board',
      'show_chart',
      'draw_figure',
    ]);
  });

  it('enregistre le jugement du tuteur et annonce la progression', async () => {
    const openai = fakeLevelOpenAI([
      [
        text('Bien joué ! Exercice suivant.'),
        toolCall('record_answer', { correct: true, hinted: false }),
        completed,
      ],
    ]);
    const { admin } = fakeAdmin();
    const { store, plays } = fakeLevelStore();
    const events = await readEvents(
      await handleChat(
        chatRequest(levelBody('maths-equations.resoudre-ax-b-c')),
        levelDeps(openai, admin, store),
      ),
    );
    expect(events).toContainEqual({ type: 'step', done: 1, total: 5 });
    expect(events.at(-1)).toEqual({ type: 'done' });
    expect([...plays.values()][0]?.answers).toEqual([{ correct: true, hinted: false }]);
  });

  it('calcule le bilan côté serveur à la dernière réponse', async () => {
    const openai = fakeLevelOpenAI([
      [text('C’est noté.'), toolCall('record_answer', { correct: true, hinted: false }), completed],
    ]);
    const { admin } = fakeAdmin({ sessionLevel: 'maths-equations.bilan' });
    const { store, plays, finished } = fakeLevelStore(10);
    plays.set('session-1', {
      levelId: 'maths-equations.bilan',
      answers: [
        ...Array(4).fill({ correct: true, hinted: false }),
        ...Array(3).fill({ correct: false, hinted: false }),
      ],
      stepsDone: 0,
      finished: false,
    });
    const events = await readEvents(
      await handleChat(
        chatRequest(
          levelBody('maths-equations.bilan', {
            conversationId: '6f8fad5b-d9cb-469f-a165-70867728950e',
          }),
        ),
        levelDeps(openai, admin, store),
      ),
    );
    const result = events.find((e) => e.type === 'levelResult');
    expect(result).toMatchObject({
      outcome: { correct: 5, total: 8, stars: 1, passed: false, xp: 10 },
    });
    expect(finished).toHaveLength(1);
  });

  it('ne reprend pas la partie d’un niveau dans un autre niveau', async () => {
    const { admin } = fakeAdmin({ sessionLevel: 'maths-equations.bilan' });
    const response = await handleChat(
      chatRequest(
        levelBody('maths-equations.isoler-x', {
          conversationId: '6f8fad5b-d9cb-469f-a165-70867728950e',
        }),
      ),
      levelDeps(fakeLevelOpenAI([]), admin),
    );
    expect(response.status).toBe(400);
  });

  it('enregistre le niveau sur la nouvelle séance', async () => {
    const openai = fakeLevelOpenAI([[text('On commence !'), completed]]);
    const { admin, inserts } = fakeAdmin();
    await readEvents(
      await handleChat(
        chatRequest(levelBody('maths-equations.isoler-x')),
        levelDeps(openai, admin),
      ),
    );
    expect(inserts.find((i) => i.table === 'study_sessions')?.row).toMatchObject({
      chapter_id: 'maths-equations',
      level_id: 'maths-equations.isoler-x',
    });
  });

  it('relance le modèle quand il n’a fait qu’appeler un outil', async () => {
    const openai = fakeLevelOpenAI([
      [toolCall('complete_step', {}), completed],
      [text('Propre ! Étape suivante.'), completed],
    ]);
    const { admin } = fakeAdmin();
    const { store } = fakeLevelStore();
    const events = await readEvents(
      await handleChat(
        chatRequest(levelBody('maths-equations.isoler-x')),
        levelDeps(openai, admin, store),
      ),
    );
    expect(openai.responses.create).toHaveBeenCalledTimes(2);
    const second = openai.responses.create.mock.calls[1]?.[0] as {
      input: { type?: string }[];
      tools?: unknown;
    };
    expect(second.input.some((item) => item.type === 'function_call_output')).toBe(true);
    expect(second.tools).toBeUndefined();
    expect(events).toContainEqual({ type: 'step', done: 1, total: 4 });
  });

  it('ignore un outil inconnu et ne retient qu’une réponse par message', async () => {
    const openai = fakeLevelOpenAI([
      [
        text('Bien joué !'),
        toolCall('set_score', { score: 1 }, 'a'),
        toolCall('record_answer', { correct: true, hinted: false }, 'b'),
        toolCall('record_answer', { correct: true, hinted: false }, 'c'),
        completed,
      ],
    ]);
    const { admin } = fakeAdmin();
    const { store, plays } = fakeLevelStore();
    await readEvents(
      await handleChat(
        chatRequest(levelBody('maths-equations.resoudre-ax-b-c')),
        levelDeps(openai, admin, store),
      ),
    );
    expect([...plays.values()][0]?.answers).toHaveLength(1);
  });

  it('ne tient pas compte des jugements d’une réponse retirée par la modération', async () => {
    const openai = fakeLevelOpenAI([
      [
        text('Réponse à retirer'),
        toolCall('record_answer', { correct: true, hinted: false }),
        completed,
      ],
    ]);
    openai.moderations.create
      .mockResolvedValueOnce({ results: [{ flagged: false, categories: {} }] })
      .mockResolvedValueOnce({ results: [{ flagged: true, categories: {} }] });
    const { admin } = fakeAdmin();
    const { store, plays } = fakeLevelStore();
    const events = await readEvents(
      await handleChat(
        chatRequest(levelBody('maths-equations.resoudre-ax-b-c')),
        levelDeps(openai, admin, store),
      ),
    );
    expect(events).toContainEqual({ type: 'retract' });
    expect(plays.size).toBe(0);
  });

  it('refuse un niveau inconnu, d’un autre chapitre ou encore à écrire', async () => {
    const { admin } = fakeAdmin();
    const { store } = fakeLevelStore();
    for (const levelId of ['maths-equations.inconnu', 'maths-relatifs.additionner-et-soustraire']) {
      const response = await handleChat(
        chatRequest(levelBody(levelId)),
        levelDeps(fakeLevelOpenAI([]), admin, store),
      );
      expect(response.status).toBe(400);
    }
  });
});

// ---------------------------------------------------------------------------
// Visuels du tuteur
// ---------------------------------------------------------------------------

const graphArgs = {
  title: '3x + 5 = 20',
  description: 'La droite rouge coupe la droite bleue en x = 5.',
  x_min: -1,
  x_max: 7,
  y_min: 0,
  y_max: 30,
  curves: [{ expression: '3x + 5', color: 'rouge', dashed: false, label: 'y = 3x + 5' }],
  points: [{ x: 5, y: 20, label: '(5 ; 20)', color: 'rouge', highlight: true }],
};
const freeBody = {
  topic: { subjectId: 'maths', chapterId: 'maths-equations' },
  history: [],
  message: 'Montre-moi',
};

describe('POST /api/tutor/chat · visuels du tuteur', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('valide le visuel, le modère avec la réponse, l’enregistre et l’envoie à l’app', async () => {
    const openai = fakeLevelOpenAI([
      [text('Regarde la droite rouge.'), toolCall('show_graph', graphArgs), completed],
    ]);
    const { admin, inserts } = fakeAdmin();
    const events = await readEvents(
      await handleChat(chatRequest(freeBody), levelDeps(openai, admin)),
    );
    const visual = events.find((e) => e.type === 'visual');
    expect(visual).toMatchObject({ visual: { kind: 'graph', xRange: [-1, 7] } });
    expect(events.indexOf(visual!)).toBeGreaterThan(events.findIndex((e) => e.type === 'delta'));
    expect(events.at(-1)).toEqual({ type: 'done' });
    const tutor = inserts.find((i) => i.table === 'messages' && i.row.role === 'tutor');
    expect(tutor?.row.visual).toMatchObject({ kind: 'graph', title: '3x + 5 = 20' });
    const moderated = openai.moderations.create.mock.calls.at(-1) as unknown as [{ input: string }];
    expect(moderated[0].input).toContain('(5 ; 20)');
  });

  it('relance le modèle s’il n’a fait que dessiner, pour qu’il explique', async () => {
    const openai = fakeLevelOpenAI([
      [
        toolCall('write_board', {
          title: 'x',
          description: 'Résolution.',
          steps: [{ tex: 'x = 5', operation: '', note: '' }],
          result: 'x = 5',
        }),
        completed,
      ],
      [text('Voilà la résolution au tableau.'), completed],
    ]);
    const { admin } = fakeAdmin();
    const events = await readEvents(
      await handleChat(chatRequest(freeBody), levelDeps(openai, admin)),
    );
    expect(openai.responses.create).toHaveBeenCalledTimes(3);
    const second = openai.responses.create.mock.calls[1]?.[0] as {
      input: { type?: string; output?: string }[];
    };
    expect(second.input.find((i) => i.type === 'function_call_output')?.output).toBe(
      '{"affiche":true}',
    );
    expect(events.some((e) => e.type === 'visual')).toBe(true);
  });

  it('ignore un visuel mal formé : la réponse arrive sans lui', async () => {
    const openai = fakeLevelOpenAI([
      [text('Regarde.'), toolCall('show_graph', { ...graphArgs, x_min: 9 }), completed],
    ]);
    const { admin } = fakeAdmin();
    const events = await readEvents(
      await handleChat(chatRequest(freeBody), levelDeps(openai, admin)),
    );
    expect(events.some((e) => e.type === 'visual')).toBe(false);
    expect(events.at(-1)).toEqual({ type: 'done' });
  });

  it('ne propose aucun outil de dessin quand le parent a désactivé les visuels', async () => {
    const openai = fakeLevelOpenAI([[text('Explication.'), completed]]);
    const { admin } = fakeAdmin({
      context: { consent_status: 'granted', evening_pause: false, visuals_enabled: false } as never,
    });
    await readEvents(await handleChat(chatRequest(freeBody), levelDeps(openai, admin)));
    const params = openai.responses.create.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(params.tools).toBeUndefined();
    expect(String(params.instructions)).not.toContain('show_graph');
  });
});

describe('POST /api/tutor/chat · chat libre', () => {
  it('accepte une question sans matière ni chapitre, et le dit au tuteur', async () => {
    const openai = fakeLevelOpenAI([[text('Bien sûr, montre-moi l’énoncé.'), completed]]);
    const { admin, inserts } = fakeAdmin();
    const response = await handleChat(
      chatRequest({ topic: {}, history: [], message: 'J’ai un exercice de physique à faire' }),
      levelDeps(openai, admin),
    );
    expect(response.status).toBe(200);
    await readEvents(response);
    const params = openai.responses.create.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(String(params.instructions)).toContain('Chat libre');
    expect(String(params.instructions)).toContain('Toutes les matières');
    expect(inserts.find((i) => i.table === 'study_sessions')?.row).toMatchObject({
      subject_id: null,
      chapter_id: null,
    });
  });

  it('titre une discussion rouverte qui n’en avait pas, et pas une discussion déjà titrée', async () => {
    const resumed = { ...body, conversationId: '6f8fad5b-d9cb-469f-a165-70867728950e' };
    const untitled = fakeAdmin({ conversationTitle: null });
    const titled = fakeAdmin();
    const first = await readEvents(
      await handleChat(chatRequest(resumed), deps(fakeOpenAI(), untitled.admin)),
    );
    const second = await readEvents(
      await handleChat(chatRequest(resumed), deps(fakeOpenAI(), titled.admin)),
    );
    expect(first.some((e) => e.type === 'title')).toBe(true);
    expect(second.some((e) => e.type === 'title')).toBe(false);
  });

  /** Tuteur qui répond, puis modèle qui nomme la discussion (titre et matière). */
  const namingOpenAI = (subject: string) => {
    const openai = fakeOpenAI();
    const stream = openai.responses.create.getMockImplementation()!;
    openai.responses.create.mockImplementationOnce(stream).mockImplementationOnce((async () => ({
      output_text: JSON.stringify({ title: 'Les forces', subject }),
    })) as never);
    return openai;
  };

  it('reconnaît la matière d’une discussion libre avec son titre, et l’écrit dans la séance', async () => {
    const { admin, updates } = fakeAdmin();
    const events = await readEvents(
      await handleChat(
        chatRequest({ topic: {}, history: [], message: 'C’est quoi une force ?' }),
        deps(namingOpenAI('physique-chimie'), admin),
      ),
    );
    expect(events).toContainEqual({
      type: 'title',
      title: 'Les forces',
      subjectId: 'physique-chimie',
    });
    expect(updates).toContainEqual({
      table: 'study_sessions',
      row: { subject_id: 'physique-chimie' },
    });
  });

  it('ne change pas la matière d’une discussion qui en a déjà une', async () => {
    const { admin, updates } = fakeAdmin();
    const events = await readEvents(
      await handleChat(chatRequest(body), deps(namingOpenAI('physique-chimie'), admin)),
    );
    expect(events).toContainEqual({ type: 'title', title: 'Les forces' });
    expect(updates.some((u) => u.table === 'study_sessions' && 'subject_id' in u.row)).toBe(false);
  });
});

describe('POST /api/tutor/chat · photo d’un exercice', () => {
  const photo = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
  const withPhoto = (extra: object = {}) => ({ ...body, image: photo, ...extra });

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    // Limite en mémoire des photos par installation : remise à zéro entre deux tests.
    (globalThis as { __tutoriaRateLimits?: Map<string, Map<string, number[]>> }).__tutoriaRateLimits
      ?.get('imageClient')
      ?.clear();
  });

  it('modère la photo, l’envoie au modèle avec le message, et n’en garde qu’une mention', async () => {
    const openai = fakeOpenAI();
    const { admin, inserts } = fakeAdmin();
    const response = await handleChat(chatRequest(withPhoto()), deps(openai, admin));
    expect(response.status).toBe(200);
    await readEvents(response);
    const moderated = openai.moderations.create.mock.calls.map(
      (call) => (call as unknown as [{ input: unknown }])[0].input,
    );
    expect(moderated).toContainEqual([{ type: 'image_url', image_url: { url: photo } }]);
    const input = (openai.responses.create.mock.calls[0]?.[0] as { input: unknown[] }).input;
    expect(input.at(-1)).toEqual({
      role: 'user',
      content: [
        { type: 'input_text', text: 'Je fais 15 − 3' },
        { type: 'input_image', image_url: photo, detail: 'auto' },
      ],
    });
    const student = inserts.find((i) => i.table === 'messages' && i.row.role === 'student');
    expect(student?.row.content).toBe('📷 Photo de l’exercice\nJe fais 15 − 3');
    expect(JSON.stringify(inserts)).not.toContain('base64');
  });

  it('accepte une photo seule, présentée au modèle par une phrase', async () => {
    const openai = fakeOpenAI();
    const { admin, inserts } = fakeAdmin();
    await readEvents(
      await handleChat(chatRequest(withPhoto({ message: '' })), deps(openai, admin)),
    );
    const input = (openai.responses.create.mock.calls[0]?.[0] as { input: unknown[] }).input;
    expect(input.at(-1)).toMatchObject({
      content: [{ type: 'input_text', text: 'Voici la photo de mon exercice.' }, {}],
    });
    const student = inserts.find((i) => i.table === 'messages' && i.row.role === 'student');
    expect(student?.row.content).toBe('📷 Photo de l’exercice');
  });

  it('refuse la photo si le parent a désactivé la caméra', async () => {
    const openai = fakeOpenAI();
    const { admin } = fakeAdmin({
      context: { consent_status: 'granted', evening_pause: false, camera_enabled: false } as never,
    });
    const response = await handleChat(chatRequest(withPhoto()), deps(openai, admin));
    expect(await response.json()).toEqual({ error: 'not_allowed' });
    expect(openai.responses.create).not.toHaveBeenCalled();
  });

  it('refuse la photo pendant une évaluation d’Explorer, pas pendant une leçon', async () => {
    const evaluation = await handleChat(
      chatRequest(levelBody('maths-equations.bilan', { image: photo })),
      levelDeps(fakeLevelOpenAI([]), fakeAdmin().admin),
    );
    expect(await evaluation.json()).toEqual({ error: 'not_allowed' });
    const lesson = await handleChat(
      chatRequest(levelBody('maths-equations.isoler-x', { image: photo })),
      levelDeps(
        fakeLevelOpenAI([[text('L’exercice : 3x + 5 = 20.'), completed]]),
        fakeAdmin().admin,
      ),
    );
    expect(lesson.status).toBe(200);
  });

  it('bloque une photo signalée par la modération, et refuse un fichier qui n’est pas une image', async () => {
    const flagged = await handleChat(
      chatRequest(withPhoto()),
      deps(fakeOpenAI({ flaggedOutput: true }), fakeAdmin().admin),
    );
    expect(await flagged.json()).toEqual({ error: 'flagged' });
    const notImage = await handleChat(
      chatRequest(withPhoto({ image: 'data:text/html;base64,PGgxPg==' })),
      deps(fakeOpenAI(), fakeAdmin().admin),
    );
    expect(notImage.status).toBe(400);
  });
});
