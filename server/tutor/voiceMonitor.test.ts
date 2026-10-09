/**
 * @jest-environment node
 */
import { attachVoiceMonitor, type MonitorDeps, type VoiceWatch } from './voiceMonitor';

const watch: VoiceWatch = {
  callId: 'rtc_1',
  instructionsHash: 'a'.repeat(64),
  tools: [],
  maxSeconds: 600,
  allowedTexts: [],
  maxPhotos: 3,
  notes: { distress: 'd', offTopic: 'o', tutorCut: 't' },
};
const env = { url: 'https://surveillant.example', token: 't'.repeat(32) };

function deps(overrides: Partial<MonitorDeps>): MonitorDeps {
  return {
    env: () => env,
    fetch: jest.fn(async () => new Response('{"ok":true}')),
    production: () => true,
    ...overrides,
  };
}

describe('attachVoiceMonitor', () => {
  it('confie l’appel au surveillant, authentifié par le secret partagé', async () => {
    const fetch = jest.fn(async () => new Response('{"ok":true}'));
    expect(await attachVoiceMonitor(watch, deps({ fetch }))).toBe(true);
    const [url, init] = fetch.mock.calls[0] as unknown as [URL, RequestInit];
    expect(String(url)).toBe('https://surveillant.example/watch');
    expect(init.headers).toMatchObject({ Authorization: `Bearer ${env.token}` });
    expect(JSON.parse(String(init.body))).toEqual(watch);
  });

  it('refuse l’appel si le surveillant ne répond pas ou refuse', async () => {
    const down = jest.fn(async () => {
      throw new TypeError('fetch failed');
    });
    expect(await attachVoiceMonitor(watch, deps({ fetch: down }))).toBe(false);
    const refused = jest.fn(async () => new Response('{}', { status: 502 }));
    expect(await attachVoiceMonitor(watch, deps({ fetch: refused }))).toBe(false);
  });

  it('sans surveillant configuré : refusé en production, permis en développement', async () => {
    expect(await attachVoiceMonitor(watch, deps({ env: () => null }))).toBe(false);
    expect(
      await attachVoiceMonitor(watch, deps({ env: () => null, production: () => false })),
    ).toBe(true);
  });
});
