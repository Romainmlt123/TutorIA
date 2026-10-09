import { logError } from '@/lib/logger';

import {
  PHOTO_CAPTION,
  type VisualCheckResponse,
  type VoiceStartRequest,
  type VoiceStartResponse,
} from '../api-contract';
import type { StartVoiceRequest, VoiceSession } from '../TutorService';
import { postTutor, TutorHttpError } from './http';
import { getRtcAdapter } from './webrtc';
import type { RtcDataChannel } from './webrtc.types';

export type VoiceErrorCode =
  'unavailable' | 'microphone' | 'rate_limited' | 'daily_limit' | 'network' | 'upstream';

export class VoiceSessionError extends Error {
  constructor(readonly code: VoiceErrorCode) {
    super(code);
  }
}

/** Événements du canal de données utilisés par l'appel (API Realtime). */
type ServerEvent = {
  type?: string;
  delta?: string;
  transcript?: string;
  name?: string;
  arguments?: string;
  call_id?: string;
};

/** Outils de visuels proposés au tuteur vocal (serveur, VISUAL_TOOLS). */
const VISUAL_TOOL_NAMES = new Set(['show_graph', 'write_board', 'show_chart', 'draw_figure']);
/** Mesure du niveau de la voix du tuteur, pour le logo qui rebondit. */
const LEVEL_INTERVAL_MS = 120;

/** Refus du micro par l'élève ou par le système (navigateur ou réglages du téléphone). */
function isPermissionDenial(error: unknown): boolean {
  const name = error instanceof Error ? error.name : '';
  return name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError';
}

/**
 * Démarre un appel vocal temps réel : micro → offre WebRTC envoyée au serveur, qui crée l'appel chez
 * OpenAI et le surveille → audio et canal de données en direct avec OpenAI. Les événements du canal
 * de données pilotent le visualiseur.
 */
export async function startRealtimeVoiceSession({
  topic,
  onEvent,
  onCaption,
  onLevel,
  onVisual,
}: StartVoiceRequest): Promise<VoiceSession> {
  const rtc = getRtcAdapter();
  if (!rtc) throw new VoiceSessionError('unavailable');

  let microphone;
  try {
    microphone = await rtc.getMicrophone();
  } catch (error) {
    // Un refus d'autorisation est un choix de l'élève, pas une panne : on ne le journalise pas.
    if (!isPermissionDenial(error)) logError('voice.microphone', error);
    throw new VoiceSessionError('microphone');
  }
  const stopMicrophone = () => microphone.getTracks().forEach((track) => track.stop());

  const peer = rtc.createPeerConnection();
  const stopAudio = rtc.playRemoteAudio(peer);
  microphone.getTracks().forEach((track) => peer.addTrack(track, microphone));
  const channel: RtcDataChannel = peer.createDataChannel('oai-events');
  let ended = false;
  let muted = false;
  let held = false;
  // Une seule réponse à la fois côté OpenAI : une demande faite pendant une réponse est mise en attente.
  let responseActive = false;
  let responseQueued = false;
  // Sous-titres : la phrase en cours du tuteur.
  let tutorText = '';
  let levelTimer: ReturnType<typeof setInterval> | null = null;

  const send = (event: object) => {
    if (channel.readyState === 'open') channel.send(JSON.stringify(event));
  };
  /** Demande une réponse au tuteur, après la sienne s'il parle encore. */
  const requestResponse = () => {
    if (responseActive) responseQueued = true;
    else send({ type: 'response.create' });
  };

  /** Niveau de la voix reçue, lu dans les mesures WebRTC (navigateur comme téléphone). */
  const measureLevel = async () => {
    try {
      const stats = await peer.getStats();
      let level = 0;
      stats.forEach((stat) => {
        if (stat.type === 'inbound-rtp' && stat.kind === 'audio' && stat.audioLevel !== undefined) {
          level = Math.max(level, stat.audioLevel);
        }
      });
      onLevel?.(Math.min(1, level * 2.5));
    } catch (error) {
      // Mesure indisponible : le logo garde un rebond régulier (voir VoiceAvatar).
      logError('voice.level', error);
      if (levelTimer) clearInterval(levelTimer);
      levelTimer = null;
    }
  };

  /** Visuel demandé par le tuteur : validé et modéré par le serveur, puis montré à l'élève. */
  const showVisual = async (event: ServerEvent) => {
    let shown = false;
    try {
      const response = await postTutor('/api/tutor/visual-check', {
        name: event.name,
        arguments: event.arguments ?? '{}',
      });
      const { visual } = (await response.json()) as VisualCheckResponse;
      onVisual?.(visual);
      shown = true;
    } catch (error) {
      logError('voice.visual', error);
    }
    send({
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: event.call_id,
        output: JSON.stringify({ shown }),
      },
    });
    // Le tuteur explique le visuel (ou continue sans lui).
    requestResponse();
  };

  channel.addEventListener('open', () => {
    onEvent({ type: 'connected' });
    // Le tuteur ouvre la conversation (consignes du prompt vocal).
    send({ type: 'response.create' });
  });
  channel.addEventListener('message', ({ data }) => {
    let event: ServerEvent;
    try {
      event = JSON.parse(String(data)) as ServerEvent;
    } catch (error) {
      logError('voice.event', error);
      return;
    }
    switch (event.type) {
      case 'response.created':
        responseActive = true;
        tutorText = '';
        break;
      case 'response.output_audio_transcript.delta':
        tutorText += event.delta ?? '';
        onCaption?.({ text: tutorText, final: false });
        break;
      case 'response.output_audio_transcript.done':
        onCaption?.({ text: event.transcript ?? tutorText, final: true });
        break;
      case 'response.function_call_arguments.done':
        if (event.name && VISUAL_TOOL_NAMES.has(event.name)) void showVisual(event);
        break;
      case 'response.done':
        responseActive = false;
        if (responseQueued) {
          responseQueued = false;
          send({ type: 'response.create' });
        }
        break;
      case 'input_audio_buffer.speech_started':
        onEvent({ type: 'userStarted' });
        break;
      case 'input_audio_buffer.speech_stopped':
        onEvent({ type: 'userStopped' });
        break;
      case 'output_audio_buffer.started':
        onEvent({ type: 'aiStarted' });
        if (onLevel && !levelTimer) levelTimer = setInterval(measureLevel, LEVEL_INTERVAL_MS);
        break;
      case 'output_audio_buffer.stopped':
      case 'output_audio_buffer.cleared':
        if (levelTimer) clearInterval(levelTimer);
        levelTimer = null;
        onLevel?.(0);
        onEvent({ type: 'aiStopped' });
        break;
      case 'error':
        logError('voice.server', event);
        break;
    }
  });
  peer.addEventListener('connectionstatechange', () => {
    if (!ended && (peer.connectionState === 'failed' || peer.connectionState === 'disconnected')) {
      onEvent({ type: 'failed' });
    }
  });

  const cleanup = () => {
    ended = true;
    if (levelTimer) clearInterval(levelTimer);
    levelTimer = null;
    channel.close();
    peer.close();
    stopMicrophone();
    stopAudio();
  };

  try {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const body: VoiceStartRequest = { topic, sdp: offer.sdp ?? '' };
    const response = await postTutor('/api/tutor/voice/start', body);
    const { sdp } = (await response.json()) as VoiceStartResponse;
    await peer.setRemoteDescription({ type: 'answer', sdp });
  } catch (error) {
    cleanup();
    // Réponse perdue (délai dépassé, réseau) ou connexion ratée après la réponse : le serveur a pu
    // ouvrir la séance, qui serait sinon comptée 10 min. On la clôt.
    const maybeOpened =
      !(error instanceof TutorHttpError) || error.code === 'timeout' || error.code === 'network';
    if (maybeOpened) {
      postTutor('/api/tutor/voice/end', {}).catch((endError: unknown) =>
        logError('voice.end', endError),
      );
    }
    if (error instanceof TutorHttpError) {
      if (error.code === 'rate_limited' || error.code === 'daily_limit') {
        throw new VoiceSessionError(error.code);
      }
      throw new VoiceSessionError('upstream');
    }
    logError('voice.connect', error);
    throw new VoiceSessionError('network');
  }

  const applyMicrophone = () =>
    microphone.getAudioTracks().forEach((track) => (track.enabled = !muted && !held));

  return {
    setMuted(value) {
      muted = value;
      applyMicrophone();
      onEvent({ type: 'muteChanged', muted: value });
    },
    holdMicrophone(hold) {
      held = hold;
      applyMicrophone();
    },
    interrupt() {
      send({ type: 'response.cancel' });
      send({ type: 'output_audio_buffer.clear' });
      onEvent({ type: 'interrupted' });
    },
    async sendExercisePhoto(dataUrl) {
      // Contrôle serveur (taille, modération) avant l'envoi dans la conversation.
      await postTutor('/api/tutor/image-check', { dataUrl });
      if (responseActive) {
        // Le tuteur parlait : on l'interrompt, la réponse sur la photo suivra la fin de la sienne.
        send({ type: 'response.cancel' });
        send({ type: 'output_audio_buffer.clear' });
      }
      send({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [
            { type: 'input_text', text: PHOTO_CAPTION },
            { type: 'input_image', image_url: dataUrl },
          ],
        },
      });
      requestResponse();
    },
    stop() {
      if (ended) return;
      cleanup();
      onEvent({ type: 'ended' });
    },
  };
}
