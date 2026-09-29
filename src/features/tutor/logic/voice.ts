/**
 * État d'un appel vocal avec le tuteur, piloté par les événements de la session
 * (simulée ou temps réel) et par les actions de l'élève.
 */
export type VoiceStatus =
  'connecting' | 'aiSpeaking' | 'userSpeaking' | 'waiting' | 'muted' | 'ended' | 'error';

export type VoiceState = {
  phase: 'connecting' | 'live' | 'ended' | 'error';
  speaker: 'ai' | 'user' | 'none';
  muted: boolean;
};

export type VoiceEvent =
  | { type: 'connected' }
  | { type: 'aiStarted' }
  | { type: 'aiStopped' }
  | { type: 'userStarted' }
  | { type: 'userStopped' }
  | { type: 'interrupted' }
  | { type: 'muteChanged'; muted: boolean }
  | { type: 'ended' }
  | { type: 'failed' };

export const initialVoiceState: VoiceState = { phase: 'connecting', speaker: 'none', muted: false };

export function voiceReducer(state: VoiceState, event: VoiceEvent): VoiceState {
  if (state.phase === 'ended' || state.phase === 'error') return state;
  switch (event.type) {
    case 'connected':
      return { ...state, phase: 'live' };
    case 'aiStarted':
      return { ...state, phase: 'live', speaker: 'ai' };
    case 'aiStopped':
      return state.speaker === 'ai' ? { ...state, speaker: 'none' } : state;
    case 'userStarted':
      // Micro coupé : la voix de l'élève n'est pas transmise.
      return state.muted ? state : { ...state, phase: 'live', speaker: 'user' };
    case 'userStopped':
      return state.speaker === 'user' ? { ...state, speaker: 'none' } : state;
    case 'interrupted':
      return { ...state, speaker: state.muted ? 'none' : 'user' };
    case 'muteChanged':
      return {
        ...state,
        muted: event.muted,
        speaker: event.muted && state.speaker === 'user' ? 'none' : state.speaker,
      };
    case 'ended':
      return { ...state, phase: 'ended', speaker: 'none' };
    case 'failed':
      return { ...state, phase: 'error', speaker: 'none' };
  }
}

export function voiceStatus(state: VoiceState): VoiceStatus {
  if (state.phase !== 'live') return state.phase;
  if (state.speaker === 'ai') return 'aiSpeaking';
  if (state.muted) return 'muted';
  return state.speaker === 'user' ? 'userSpeaking' : 'waiting';
}

/** Animation des barres : IA (rapide, 40–190 px), élève (plus doux, 40–100 px) ou repos (40 px). */
export type BarsMode = 'ai' | 'user' | 'rest';

export function barsMode(status: VoiceStatus): BarsMode {
  if (status === 'aiSpeaking') return 'ai';
  if (status === 'userSpeaking') return 'user';
  return 'rest';
}

export const BAR_COUNT = 4;
export const BAR_REST = 40;

/**
 * Hauteur des 4 barres à l'instant `t` (secondes), formules de la maquette 02b :
 * chaque barre a sa propre phase, avec des micro-pauses quand le tuteur parle.
 */
export function barHeights(mode: BarsMode, t: number): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    if (mode === 'ai') {
      const envelope = 0.55 + 0.45 * Math.sin(t * 1.3 + i * 0.4);
      const wave =
        0.5 + 0.5 * (0.6 * Math.sin(t * 7.1 + i * 1.7) + 0.4 * Math.sin(t * 3.3 + i * 2.9));
      const pause = Math.sin(t * 0.8) > 0.92 ? 0.15 : 1;
      return Math.round(BAR_REST + 150 * wave * envelope * pause);
    }
    if (mode === 'user') {
      const wave = 0.5 + 0.5 * Math.sin(t * 3.2 + i * 1.3);
      const envelope = 0.6 + 0.4 * Math.sin(t * 0.9 + i);
      return Math.round(BAR_REST + 60 * wave * envelope);
    }
    return BAR_REST;
  });
}

/** Chrono de l'appel : 134 → « 02:14 ». */
export function formatCallTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
