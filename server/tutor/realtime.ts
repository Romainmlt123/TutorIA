import type OpenAI from 'openai';

import { startPlay } from '@/features/explorer/logic/levelPlay';
import type { RealtimeSessionResponse, TutorTopic } from '@/services/tutor/api-contract';

import { getServerEnv, REALTIME_VOICE } from '../env';
import { parseTopic } from '../guards/limits';
import { limiters } from '../guards/rateLimit';
import { errorResponse, identify, jsonResponse, readJsonBody } from '../http';
import { serverLog } from '../log';
import { getOpenAI } from '../openai';
import { levelInstructions, levelOfTopic } from './level';
import { buildTutorInstructions } from './prompt';
import { promptContextOf } from './topic';
import { VISUAL_TOOLS } from './visuals';

/** Le jeton ne sert qu'à établir la connexion : 60 s suffisent. */
const CLIENT_SECRET_TTL_S = 60;

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

/**
 * POST /api/tutor/realtime-session : délivre un jeton temporaire pour l'API Realtime.
 * La configuration (modèle, consignes, voix) est figée ici : l'app ne voit ni la clé ni le modèle.
 */
export async function handleRealtimeSession(
  request: Request,
  deps: RealtimeDeps = defaultDeps,
  options: RealtimeOptions = { visuals: false },
): Promise<Response> {
  const { clientId, ip } = identify(request);
  if (!clientId) return errorResponse('bad_request');
  if (!limiters.voiceIp.consume(ip) || !limiters.voiceClient.consume(clientId)) {
    return errorResponse('rate_limited');
  }

  let body: unknown;
  try {
    body = await readJsonBody(request, 4_000);
  } catch {
    return errorResponse('bad_request');
  }
  const topic = parseTopic(body);
  if (!topic.ok) return errorResponse(topic.code);

  // Les appels d'outils arrivent sur le téléphone : chaque visuel repasse par /api/tutor/visual-check.
  const visuals = options.visuals && !levelOfTopic(topic.value);
  try {
    const secret = await deps.openai().realtime.clientSecrets.create({
      expires_after: { anchor: 'created_at', seconds: CLIENT_SECRET_TTL_S },
      session: {
        type: 'realtime',
        model: deps.vocalModel(),
        instructions: voiceInstructions(topic.value, visuals),
        output_modalities: ['audio'],
        max_output_tokens: 600,
        ...(visuals ? { tools: REALTIME_VISUAL_TOOLS, tool_choice: 'auto' as const } : {}),
        audio: {
          input: { turn_detection: { type: 'semantic_vad' } },
          output: { voice: REALTIME_VOICE },
        },
      },
    });
    const response: RealtimeSessionResponse = {
      clientSecret: secret.value,
      expiresAt: secret.expires_at,
    };
    return jsonResponse(response);
  } catch (error) {
    serverLog.error('realtime.secret', error);
    return errorResponse('upstream');
  }
}
