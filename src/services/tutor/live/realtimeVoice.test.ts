import type { VoiceEvent } from '@/features/tutor/logic/voice';

import { startRealtimeVoiceSession } from './realtimeVoice';

type Listener = (event: { data: unknown }) => void;

const mockSent: { type: string; item?: { type?: string; content: { type: string }[] } }[] = [];
const mockListeners: Record<string, Listener[]> = {};
const mockTrack = { enabled: true, stop: jest.fn() };

const mockChannel = {
  readyState: 'open',
  send: (data: string) => mockSent.push(JSON.parse(data)),
  close: jest.fn(),
  addEventListener: (type: string, listener: Listener) =>
    (mockListeners[type] ??= []).push(listener),
};

jest.mock('./webrtc', () => ({
  getRtcAdapter: () => ({
    getMicrophone: async () => ({
      getTracks: () => [mockTrack],
      getAudioTracks: () => [mockTrack],
    }),
    playRemoteAudio: () => () => undefined,
    createPeerConnection: () => ({
      connectionState: 'connected',
      createDataChannel: () => mockChannel,
      addTrack: jest.fn(),
      createOffer: async () => ({ type: 'offer', sdp: 'offre' }),
      setLocalDescription: async () => undefined,
      setRemoteDescription: async () => undefined,
      addEventListener: jest.fn(),
      close: jest.fn(),
    }),
  }),
}));

jest.mock('./http', () => ({
  TutorHttpError: class extends Error {
    code: string;
    constructor(mockCode: string) {
      super(mockCode);
      this.code = mockCode;
    }
  },
  postTutor: jest.fn(async (path: string) => ({
    json: async () =>
      path === '/api/tutor/visual-check'
        ? { visual: { kind: 'board', title: '3x + 5 = 20', description: 'Résolution', steps: [] } }
        : { sdp: 'réponse' },
  })),
}));

const server = (type: string, fields: object = {}) =>
  mockListeners.message?.forEach((l) => l({ data: JSON.stringify({ type, ...fields }) }));
const types = () => mockSent.map((e) => e.type);

describe('session vocale temps réel', () => {
  let events: VoiceEvent['type'][];

  beforeEach(() => {
    mockSent.length = 0;
    Object.keys(mockListeners).forEach((k) => delete mockListeners[k]);
    events = [];
    mockTrack.enabled = true;
  });

  async function start() {
    const session = await startRealtimeVoiceSession({
      topic: { subjectId: 'maths', chapterId: 'maths-equations' },
      onEvent: (e) => events.push(e.type),
    });
    mockListeners.open?.forEach((l) => l({ data: null }));
    return session;
  }

  it('envoie l’offre WebRTC au serveur, qui crée l’appel', async () => {
    const { postTutor } = jest.requireMock<{ postTutor: jest.Mock }>('./http');
    await start();
    expect(postTutor).toHaveBeenCalledWith('/api/tutor/voice/start', {
      topic: { subjectId: 'maths', chapterId: 'maths-equations' },
      sdp: 'offre',
    });
  });

  it('fait parler le tuteur à l’ouverture et traduit les événements d’OpenAI', async () => {
    await start();
    expect(types()).toEqual(['response.create']);
    server('output_audio_buffer.started');
    server('input_audio_buffer.speech_started');
    expect(events).toEqual(['connected', 'aiStarted', 'userStarted']);
  });

  it('envoie la photo avec sa légende et demande une réponse', async () => {
    const session = await start();
    await session.sendExercisePhoto('data:image/jpeg;base64,AAAA');
    const item = mockSent.find((e) => e.type === 'conversation.item.create');
    expect(item?.item?.content.map((c) => c.type)).toEqual(['input_text', 'input_image']);
    expect(types().at(-1)).toBe('response.create');
  });

  it('attend la fin de la réponse en cours avant de répondre sur la photo', async () => {
    const session = await start();
    server('response.created');
    await session.sendExercisePhoto('data:image/jpeg;base64,AAAA');
    expect(types()).toEqual([
      'response.create',
      'response.cancel',
      'output_audio_buffer.clear',
      'conversation.item.create',
    ]);
    server('response.done');
    expect(types().at(-1)).toBe('response.create');
  });

  it('suspend le micro pendant la photo sans changer l’état affiché', async () => {
    const session = await start();
    session.holdMicrophone(true);
    expect(mockTrack.enabled).toBe(false);
    session.holdMicrophone(false);
    expect(mockTrack.enabled).toBe(true);
    session.setMuted(true);
    session.holdMicrophone(false);
    expect(mockTrack.enabled).toBe(false);
    expect(events).toEqual(['connected', 'muteChanged']);
  });

  it('transmet les sous-titres du tuteur au fil de sa transcription', async () => {
    const captions: string[] = [];
    await startRealtimeVoiceSession({
      topic: { subjectId: 'maths' },
      onEvent: () => undefined,
      onCaption: (c) => captions.push(`${c.final ? 'fin' : '…'}:${c.text}`),
    });
    mockListeners.open?.forEach((l) => l({ data: null }));
    server('response.created');
    server('response.output_audio_transcript.delta', { delta: 'On retire ' });
    server('response.output_audio_transcript.delta', { delta: '5.' });
    server('response.output_audio_transcript.done', { transcript: 'On retire 5.' });
    expect(captions).toEqual(['…:On retire ', '…:On retire 5.', 'fin:On retire 5.']);
  });

  it('fait valider le visuel demandé par le tuteur, le montre, puis le laisse l’expliquer', async () => {
    const onVisual = jest.fn();
    await startRealtimeVoiceSession({
      topic: { subjectId: 'maths' },
      onEvent: () => undefined,
      onVisual,
    });
    mockListeners.open?.forEach((l) => l({ data: null }));
    server('response.function_call_arguments.done', {
      name: 'write_board',
      arguments: '{}',
      call_id: 'appel-1',
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onVisual).toHaveBeenCalledWith(expect.objectContaining({ kind: 'board' }));
    const output = mockSent.find((e) => e.type === 'conversation.item.create');
    expect(output?.item).toMatchObject({ type: 'function_call_output', call_id: 'appel-1' });
    expect(types().at(-1)).toBe('response.create');
  });

  it('clôt la séance quand la réponse du serveur se perd, mais pas après un refus', async () => {
    const http = jest.requireMock<{
      postTutor: jest.Mock;
      TutorHttpError: new (code: string) => Error;
    }>('./http');
    http.postTutor.mockClear();
    http.postTutor.mockRejectedValueOnce(new http.TutorHttpError('timeout'));
    await expect(start()).rejects.toMatchObject({ code: 'upstream' });
    expect(http.postTutor).toHaveBeenLastCalledWith('/api/tutor/voice/end', {});

    http.postTutor.mockClear();
    http.postTutor.mockRejectedValueOnce(new http.TutorHttpError('rate_limited'));
    await expect(start()).rejects.toMatchObject({ code: 'rate_limited' });
    expect(http.postTutor).not.toHaveBeenCalledWith('/api/tutor/voice/end', {});
  });
});
