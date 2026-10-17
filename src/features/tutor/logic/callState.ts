import type { VoiceStatus } from './voice';

/**
 * État affiché par l'écran d'appel (logo et pastille), tiré de `voiceStatus` (v2.6). `limit` : les
 * appels du jour sont faits (R4, v2.15), l'appel n'a pas commencé.
 */
export type CallState =
  'connecting' | 'speaking' | 'listening' | 'muted' | 'ended' | 'error' | 'limit';

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
