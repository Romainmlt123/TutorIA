import type OpenAI from 'openai';

import type { TutorStreamEvent } from '@/services/tutor/api-contract';

import { getServerEnv, ServerConfigError } from '../env';
import { moderateText } from '../guards/moderation';
import { limiters } from '../guards/rateLimit';
import { validateChat, type ValidChat } from '../guards/limits';
import { errorResponse, identify, ndjsonResponse, readJsonBody, sha256 } from '../http';
import { serverLog } from '../log';
import { getOpenAI } from '../openai';
import { getAdminClient, type AdminClient } from '../supabase';
import { requireTutorAccess } from './access';
import { openConversation, recordMessage, type Conversation } from './conversation';
import { buildTutorInstructions, TUTOR_PROMPT_VERSION } from './prompt';
import { promptContextOf } from './topic';

/** Délai maximal de la réponse du modèle. */
const UPSTREAM_TIMEOUT_MS = 20_000;
/** Réponses courtes par consigne ; la marge couvre un éventuel raisonnement du modèle. */
const MAX_OUTPUT_TOKENS = 800;

type ChatClient = Pick<OpenAI, 'moderations' | 'responses'>;

export type ChatDeps = {
  openai: () => ChatClient;
  textModel: () => string;
  admin: () => AdminClient;
};

const defaultDeps: ChatDeps = {
  openai: getOpenAI,
  textModel: () => getServerEnv().textModel,
  admin: getAdminClient,
};

type Recording = { admin: AdminClient; conversation: Conversation; studentId: string };

async function* streamReply(
  client: ChatClient,
  model: string,
  chat: ValidChat,
  safetyId: string,
  signal: AbortSignal,
  recording: Recording,
): AsyncGenerator<TutorStreamEvent> {
  if (recording.conversation.created) {
    yield { type: 'conversation', id: recording.conversation.id };
  }
  let text = '';
  try {
    const stream = await client.responses.create(
      {
        model,
        instructions: buildTutorInstructions(promptContextOf(chat.topic, 'text')),
        input: [
          ...chat.history.map((turn) => ({
            role: turn.role === 'student' ? ('user' as const) : ('assistant' as const),
            content: turn.text,
          })),
          { role: 'user' as const, content: chat.message },
        ],
        stream: true,
        store: false,
        max_output_tokens: MAX_OUTPUT_TOKENS,
        safety_identifier: safetyId,
        prompt_cache_key: `tutoria-tutor-${TUTOR_PROMPT_VERSION}`,
      },
      { signal },
    );
    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        text += event.delta;
        yield { type: 'delta', text: event.delta };
      } else if (event.type === 'response.failed' || event.type === 'error') {
        serverLog.warn('chat.failed', { type: event.type });
        yield { type: 'error', code: 'upstream' };
        return;
      } else if (event.type === 'response.incomplete' && !text) {
        serverLog.warn('chat.incomplete', { reason: event.response.incomplete_details?.reason });
        yield { type: 'error', code: 'upstream' };
        return;
      }
    }
  } catch (error) {
    serverLog.error('chat.stream', error);
    yield { type: 'error', code: signal.aborted ? 'timeout' : 'upstream' };
    return;
  }

  // Modération de la réponse complète : si elle est signalée, l'app la retire (et rien n'est gardé).
  let kept = Boolean(text);
  try {
    if (text && (await moderateText(client, text)) !== 'ok') {
      serverLog.warn('chat.retract', { promptVersion: TUTOR_PROMPT_VERSION });
      kept = false;
      yield { type: 'retract' };
    }
  } catch (error) {
    serverLog.error('chat.moderation', error);
    kept = false;
    yield { type: 'retract' };
  }
  if (kept) {
    await recordMessage(
      recording.admin,
      recording.conversation,
      recording.studentId,
      'tutor',
      text,
    );
  }
  yield { type: 'done' };
}

/**
 * POST /api/tutor/chat : élève connecté et autorisé, garde-fous, modération, puis réponse en flux.
 * L'historique est relu en base (conversation de l'élève) ; les messages y sont enregistrés.
 */
export async function handleChat(
  request: Request,
  deps: ChatDeps = defaultDeps,
): Promise<Response> {
  const { ip } = identify(request);
  if (!limiters.chatIp.consume(ip)) return errorResponse('rate_limited');

  let admin: AdminClient;
  let client: ChatClient;
  let model: string;
  try {
    admin = deps.admin();
    client = deps.openai();
    model = deps.textModel();
  } catch (error) {
    serverLog.error(error instanceof ServerConfigError ? 'config' : 'chat.init', error);
    return errorResponse('upstream');
  }

  const access = await requireTutorAccess(request, admin, 'chat');
  if (!access.ok) return access.response;
  const studentId = access.user.id;

  let body: unknown;
  try {
    body = await readJsonBody(request, 32_000);
  } catch {
    return errorResponse('bad_request');
  }
  const chat = validateChat(body);
  if (!chat.ok) return errorResponse(chat.code);

  try {
    const verdict = await moderateText(client, chat.value.message);
    if (verdict !== 'ok') {
      serverLog.warn('chat.input', { verdict });
      return errorResponse(verdict);
    }
  } catch (error) {
    // Modération indisponible : on n'envoie rien au modèle (public mineur).
    serverLog.error('chat.moderation', error);
    return errorResponse('upstream');
  }

  let conversation: Conversation | null;
  try {
    conversation = await openConversation(
      admin,
      studentId,
      chat.value.topic,
      (body as { conversationId?: unknown }).conversationId,
    );
  } catch (error) {
    serverLog.error('chat.conversation', error);
    return errorResponse('upstream');
  }
  if (!conversation) return errorResponse('bad_request');

  await recordMessage(admin, conversation, studentId, 'student', chat.value.message);
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)]);
  const safetyId = await sha256(studentId);
  const withHistory: ValidChat = { ...chat.value, history: conversation.history };
  return ndjsonResponse(
    streamReply(client, model, withHistory, safetyId, signal, { admin, conversation, studentId }),
  );
}
