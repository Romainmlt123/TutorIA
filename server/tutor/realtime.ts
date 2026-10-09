import type OpenAI from 'openai';
import { z } from 'zod';

import { startPlay } from '@/features/explorer/logic/levelPlay';
import { TUTOR_LIMITS, type TutorTopic } from '@/services/tutor/api-contract';

import { getServerEnv, REALTIME_TRANSCRIPTION_MODEL, REALTIME_VOICE } from '../env';
import { parseTopic } from '../guards/limits';
import { readJsonBody } from '../http';
import { getOpenAI } from '../openai';
import { levelInstructions, levelOfTopic } from './level';
import { buildTutorInstructions } from './prompt';
import { promptContextOf } from './topic';
import { VISUAL_TOOLS } from './visuals';

type RealtimeClient = Pick<OpenAI, 'realtime'>;

export type RealtimeDeps = { openai: () => RealtimeClient; vocalModel: () => string };

const defaultDeps: RealtimeDeps = {
  openai: getOpenAI,
  vocalModel: () => getServerEnv().vocalModel,
};

/**
 * Consignes de l'appel : le sujet, et pour une leçon d'Explorer, son déroulé (sans outil à l'oral).
 * Hors d'Explorer, le tuteur peut montrer des visuels si le parent les autorise (2D, 2F).
 */
function voiceInstructions(topic: TutorTopic, visuals: boolean): string {
  const context = promptContextOf(topic, 'voice');
  const place = levelOfTopic(topic);
  if (!place) return buildTutorInstructions({ ...context, visuals });
  const level = levelInstructions(place, startPlay(place.level.id), 'voice');
  return buildTutorInstructions({ ...context, level });
}

/** Outils de visuels au format de l'API Realtime (sans `strict`). */
const REALTIME_VISUAL_TOOLS = VISUAL_TOOLS.map(({ name, description, parameters }) => ({
  type: 'function' as const,
  name,
  description: description ?? '',
  parameters: parameters ?? {},
}));

/** Options fixées par l'enveloppe (réglages du parent). */
export type RealtimeOptions = { visuals: boolean };

/** Corps de POST /api/tutor/voice/start : le sujet et l'offre WebRTC du téléphone. */
const startSchema = z.object({
  sdp: z.string().startsWith('v=0').max(TUTOR_LIMITS.sdpMaxChars),
});

export type VoiceStart = { topic: TutorTopic; sdp: string };

/** Lit le début d'un appel ; `null` si la requête est mal formée. */
export async function readVoiceStart(request: Request): Promise<VoiceStart | null> {
  let body: unknown;
  try {
    body = await readJsonBody(request, TUTOR_LIMITS.sdpMaxChars + 4_000);
  } catch {
    return null;
  }
  const topic = parseTopic(body);
  const offer = startSchema.safeParse(body);
  if (!topic.ok || !offer.success) return null;
  return { topic: topic.value, sdp: offer.data.sdp };
}

export type RealtimeCall = {
  sdp: string;
  callId: string;
  /** Consignes et outils fixés à la création : le surveillant vérifie qu'ils ne changent pas. */
  instructions: string;
  tools: string[];
};

/**
 * Crée l'appel chez OpenAI à partir de l'offre du téléphone (interface unifiée de l'API Realtime).
 * La configuration (modèle, consignes, voix, outils) est fixée ici, avec la clé du serveur : le
 * téléphone ne reçoit que la réponse SDP. L'identifiant de l'appel permet au serveur de le suivre.
 */
export async function openRealtimeCall(
  { topic, sdp }: VoiceStart,
  options: RealtimeOptions,
  deps: RealtimeDeps = defaultDeps,
): Promise<RealtimeCall> {
  // Les appels d'outils arrivent sur le téléphone : chaque visuel repasse par /api/tutor/visual-check.
  const visuals = options.visuals && !levelOfTopic(topic);
  const instructions = voiceInstructions(topic, visuals);
  const response = await deps.openai().realtime.calls.create({
    sdp,
    session: {
      type: 'realtime',
      model: deps.vocalModel(),
      instructions,
      output_modalities: ['audio'],
      max_output_tokens: 600,
      ...(visuals ? { tools: REALTIME_VISUAL_TOOLS, tool_choice: 'auto' as const } : {}),
      audio: {
        input: {
          turn_detection: { type: 'semantic_vad' },
          // Pour le surveillant, qui modère ce que dit l'élève ; l'app n'affiche pas ce texte.
          transcription: { model: REALTIME_TRANSCRIPTION_MODEL, language: 'fr' },
        },
        output: { voice: REALTIME_VOICE },
      },
    },
  });
  // « Location: /v1/realtime/calls/rtc_… » : le dernier segment est l'identifiant de l'appel.
  const callId = response.headers.get('Location')?.split('/').pop();
  if (!callId) throw new Error('Appel créé sans identifiant (en-tête Location absent)');
  return {
    sdp: await response.text(),
    callId,
    instructions,
    tools: visuals ? REALTIME_VISUAL_TOOLS.map((tool) => tool.name) : [],
  };
}

/** Raccroche un appel créé qui ne doit pas continuer (surveillant absent). */
export async function hangUpRealtimeCall(
  callId: string,
  deps: RealtimeDeps = defaultDeps,
): Promise<void> {
  await deps.openai().realtime.calls.hangup(callId);
}
