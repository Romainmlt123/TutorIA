import {
  barHeights,
  barsMode,
  formatCallTime,
  initialVoiceState,
  voiceReducer,
  voiceStatus,
  type VoiceEvent,
} from './voice';

const play = (events: VoiceEvent[]) => events.reduce(voiceReducer, initialVoiceState);

describe('état de l’appel vocal', () => {
  it('passe de la connexion à l’écoute, puis au tuteur qui parle', () => {
    expect(voiceStatus(initialVoiceState)).toBe('connecting');
    expect(voiceStatus(play([{ type: 'connected' }]))).toBe('waiting');
    expect(voiceStatus(play([{ type: 'connected' }, { type: 'aiStarted' }]))).toBe('aiSpeaking');
    expect(voiceStatus(play([{ type: 'connected' }, { type: 'userStarted' }]))).toBe(
      'userSpeaking',
    );
  });

  it('donne la parole à l’élève quand il interrompt le tuteur', () => {
    const state = play([{ type: 'aiStarted' }, { type: 'interrupted' }]);
    expect(voiceStatus(state)).toBe('userSpeaking');
  });

  it('affiche « micro coupé » et ignore la voix de l’élève', () => {
    const state = play([
      { type: 'connected' },
      { type: 'muteChanged', muted: true },
      { type: 'userStarted' },
    ]);
    expect(voiceStatus(state)).toBe('muted');
    expect(barsMode(voiceStatus(state))).toBe('rest');
  });

  it('laisse le tuteur parler même micro coupé', () => {
    const state = play([{ type: 'muteChanged', muted: true }, { type: 'aiStarted' }]);
    expect(voiceStatus(state)).toBe('aiSpeaking');
  });

  it('reste terminé après avoir raccroché', () => {
    const state = play([{ type: 'aiStarted' }, { type: 'ended' }, { type: 'aiStarted' }]);
    expect(voiceStatus(state)).toBe('ended');
  });
});

describe('barres du visualiseur', () => {
  const samples = Array.from({ length: 400 }, (_, i) => i * 0.1);

  it('varient de 40 à 190 px quand le tuteur parle', () => {
    const heights = samples.flatMap((t) => barHeights('ai', t));
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(40);
    expect(Math.max(...heights)).toBeLessThanOrEqual(190);
    expect(Math.max(...heights)).toBeGreaterThan(150);
  });

  it('varient de 40 à 100 px quand l’élève parle', () => {
    const heights = samples.flatMap((t) => barHeights('user', t));
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(40);
    expect(Math.max(...heights)).toBeLessThanOrEqual(100);
  });

  it('restent des pastilles de 40 px au repos', () => {
    expect(barHeights('rest', 3.2)).toEqual([40, 40, 40, 40]);
  });

  it('formate le chrono de l’appel', () => {
    expect(formatCallTime(134)).toBe('02:14');
    expect(formatCallTime(5)).toBe('00:05');
  });
});
