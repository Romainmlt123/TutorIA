import type { VoiceStatus } from './voice';

/** État affiché par l'écran d'appel (logo et pastille), tiré de `voiceStatus` (v2.6). */
export type CallState = 'connecting' | 'speaking' | 'listening' | 'muted' | 'ended' | 'error';

export function callStateOf(status: VoiceStatus): CallState {
  switch (status) {
    case 'aiSpeaking':
      return 'speaking';
    case 'userSpeaking':
    case 'waiting':
      return 'listening';
    default:
      return status;
  }
}
