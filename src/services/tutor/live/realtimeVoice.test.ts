import type { VoiceEvent } from '@/features/tutor/logic/voice';

import { startRealtimeVoiceSession } from './realtimeVoice';

type Listener = (event: { data: unknown }) => void;

const mockSent: { type: string; item?: { content: { type: string }[] } }[] = [];
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
  TutorHttpError: class extends Error {},
  postTutor: jest.fn(async () => ({
    json: async () => ({ clientSecret: 'ek_test', expiresAt: 0 }),
  })),
}));

jest.mock('expo/fetch', () => ({ fetch: async () => ({ ok: true, text: async () => 'réponse' }) }));

const server = (type: string) =>
  mockListeners.message?.forEach((l) => l({ data: JSON.stringify({ type }) }));
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
});
