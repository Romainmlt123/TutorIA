import type OpenAI from 'openai';

import type { RealtimeSessionResponse } from '@/services/tutor/api-contract';

import { getServerEnv, REALTIME_VOICE } from '../env';
import { parseTopic } from '../guards/limits';
import { limiters } from '../guards/rateLimit';
import { errorResponse, identify, jsonResponse, readJsonBody } from '../http';
import { serverLog } from '../log';
import { getOpenAI } from '../openai';
import { buildTutorInstructions } from './prompt';
import { promptContextOf } from './topic';

/** Le jeton ne sert qu'à établir la connexion : 60 s suffisent. */
const CLIENT_SECRET_TTL_S = 60;

type RealtimeClient = Pick<OpenAI, 'realtime'>;

export type RealtimeDeps = { openai: () => RealtimeClient; vocalModel: () => string };

const defaultDeps: RealtimeDeps = {
  openai: getOpenAI,
  vocalModel: () => getServerEnv().vocalModel,
};

/**
 * POST /api/tutor/realtime-session : délivre un jeton temporaire pour l'API Realtime.
 * La configuration (modèle, consignes, voix) est figée ici : l'app ne voit ni la clé ni le modèle.
 */
export async function handleRealtimeSession(
  request: Request,
  deps: RealtimeDeps = defaultDeps,
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

  try {
    const secret = await deps.openai().realtime.clientSecrets.create({
      expires_after: { anchor: 'created_at', seconds: CLIENT_SECRET_TTL_S },
      session: {
        type: 'realtime',
        model: deps.vocalModel(),
        instructions: buildTutorInstructions(promptContextOf(topic.value, 'voice')),
        output_modalities: ['audio'],
        max_output_tokens: 600,
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
