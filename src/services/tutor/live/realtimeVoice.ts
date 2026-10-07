import { fetch } from 'expo/fetch';

import { logError } from '@/lib/logger';

import { PHOTO_CAPTION, type RealtimeSessionResponse } from '../api-contract';
import type { StartVoiceRequest, VoiceSession } from '../TutorService';
import { postTutor, TutorHttpError } from './http';
import { getRtcAdapter } from './webrtc';
import type { RtcDataChannel } from './webrtc.types';

/** Échange SDP avec l'API Realtime, authentifié par le jeton temporaire (jamais la clé). */
const REALTIME_CALLS_URL = 'https://api.openai.com/v1/realtime/calls';

export type VoiceErrorCode = 'unavailable' | 'microphone' | 'rate_limited' | 'network' | 'upstream';

export class VoiceSessionError extends Error {
  constructor(readonly code: VoiceErrorCode) {
    super(code);
  }
}

type ServerEvent = { type?: string };

/** Refus du micro par l'élève ou par le système (navigateur ou réglages du téléphone). */
function isPermissionDenial(error: unknown): boolean {
  const name = error instanceof Error ? error.name : '';
  return name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError';
}

/**
 * Démarre un appel vocal temps réel : micro → jeton temporaire (serveur) → WebRTC direct avec OpenAI.
 * Les événements du canal de données pilotent le visualiseur.
 */
export async function startRealtimeVoiceSession({
  topic,
  onEvent,
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

  let secret: RealtimeSessionResponse;
  try {
    const response = await postTutor('/api/tutor/realtime-session', { topic });
    secret = (await response.json()) as RealtimeSessionResponse;
  } catch (error) {
    stopMicrophone();
    if (error instanceof TutorHttpError && error.code === 'rate_limited') {
      throw new VoiceSessionError('rate_limited');
    }
    throw new VoiceSessionError(error instanceof TutorHttpError ? 'upstream' : 'network');
  }

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

  const send = (event: object) => {
    if (channel.readyState === 'open') channel.send(JSON.stringify(event));
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
        break;
      case 'output_audio_buffer.stopped':
      case 'output_audio_buffer.cleared':
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
    channel.close();
    peer.close();
    stopMicrophone();
    stopAudio();
  };

  try {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const answer = await fetch(REALTIME_CALLS_URL, {
      method: 'POST',
      body: offer.sdp ?? '',
      headers: {
        Authorization: `Bearer ${secret.clientSecret}`,
        'Content-Type': 'application/sdp',
      },
    });
    if (!answer.ok) throw new Error(`Réponse SDP ${answer.status}`);
    await peer.setRemoteDescription({ type: 'answer', sdp: await answer.text() });
  } catch (error) {
    logError('voice.connect', error);
    cleanup();
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
        responseQueued = true;
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
      if (!responseQueued) send({ type: 'response.create' });
    },
    stop() {
      if (ended) return;
      cleanup();
      onEvent({ type: 'ended' });
    },
  };
}
