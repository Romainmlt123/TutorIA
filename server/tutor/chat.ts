import type OpenAI from 'openai';

import type { LevelPlace } from '@/features/explorer/content';
import {
  applyCalls,
  parseLevelCall,
  progressOf,
  startPlay,
  type LevelCall,
  type LevelPlay,
} from '@/features/explorer/logic/levelPlay';
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
import {
  LEVEL_TOOLS,
  levelInstructions,
  levelOfTopic,
  unavailableLevelStore,
  type LevelStore,
} from './level';
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
  /** Enregistrement des niveaux d'Explorer (absent : les niveaux ne se jouent qu'en simulé). */
  levels?: () => LevelStore;
};

const defaultDeps: ChatDeps = {
  openai: getOpenAI,
  textModel: () => getServerEnv().textModel,
  admin: getAdminClient,
};

type Recording = { admin: AdminClient; conversation: Conversation; studentId: string };

/** Niveau d'Explorer en cours de jeu dans cette discussion. */
type LevelContext = { place: LevelPlace; play: LevelPlay; store: LevelStore };

type ModelInput = OpenAI.Responses.ResponseInputItem[];
type FunctionCall = OpenAI.Responses.ResponseFunctionToolCall;

/** Tours du modèle par message : la réponse, puis une relance si le modèle n'a fait qu'appeler un outil. */
const MAX_MODEL_ROUNDS = 2;

/**
 * Applique les jugements du tuteur au niveau (plafonnés par levelPlay), les enregistre, puis annonce
 * la progression et, à la fin, le bilan calculé par le serveur.
 */
async function* applyLevelCalls(
  context: LevelContext,
  calls: readonly LevelCall[],
  recording: Recording,
): AsyncGenerator<TutorStreamEvent> {
  const { place, store } = context;
  const turn = applyCalls(place.level, context.play, calls);
  if (turn.play === context.play) return;
  context.play = turn.play;
  const sessionId = recording.conversation.sessionId;
  await store.save(sessionId, recording.studentId, turn.play);
  if (turn.progressed) yield { type: 'step', ...progressOf(place.level, turn.play) };
  if (turn.outcome) {
    await store.finish(sessionId, recording.studentId, place, turn.outcome);
    yield { type: 'levelResult', outcome: turn.outcome };
  }
}

async function* streamReply(
  client: ChatClient,
  model: string,
  chat: ValidChat,
  safetyId: string,
  signal: AbortSignal,
  recording: Recording,
  level: LevelContext | null,
): AsyncGenerator<TutorStreamEvent> {
  if (recording.conversation.created) {
    yield { type: 'conversation', id: recording.conversation.id };
  }
  const context = promptContextOf(chat.topic, 'text');
  const instructions = buildTutorInstructions(
    level ? { ...context, level: levelInstructions(level.place, level.play, 'text') } : context,
  );
  const tools = level && !level.play.finished ? LEVEL_TOOLS : [];
  let input: ModelInput = [
    ...chat.history.map((turn) => ({
      role: turn.role === 'student' ? ('user' as const) : ('assistant' as const),
      content: turn.text,
    })),
    { role: 'user' as const, content: chat.message },
  ];
  let text = '';
  const calls: FunctionCall[] = [];
  try {
    for (let round = 0; round < MAX_MODEL_ROUNDS; round++) {
      const roundCalls: FunctionCall[] = [];
      const stream = await client.responses.create(
        {
          model,
          instructions,
          input,
          ...(tools.length && round === 0 ? { tools, tool_choice: 'auto' as const } : {}),
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
        } else if (
          event.type === 'response.output_item.done' &&
          event.item.type === 'function_call'
        ) {
          roundCalls.push(event.item);
        } else if (event.type === 'response.failed' || event.type === 'error') {
          serverLog.warn('chat.failed', { type: event.type });
          yield { type: 'error', code: 'upstream' };
          return;
        } else if (event.type === 'response.incomplete' && !text && !roundCalls.length) {
          serverLog.warn('chat.incomplete', { reason: event.response.incomplete_details?.reason });
          yield { type: 'error', code: 'upstream' };
          return;
        }
      }
      calls.push(...roundCalls);
      // Le modèle n'a fait qu'appeler un outil : on lui renvoie l'avancement pour qu'il réponde.
      if (text || !roundCalls.length || !level) break;
      const progress = progressOf(
        level.place.level,
        applyCalls(level.place.level, level.play, parsed(calls)).play,
      );
      input = [
        ...input,
        ...roundCalls,
        ...roundCalls.map((call) => ({
          type: 'function_call_output' as const,
          call_id: call.call_id,
          output: JSON.stringify({ enregistre: true, avancement: progress }),
        })),
      ];
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
    // Les jugements ne comptent qu'avec une réponse gardée (jamais avec une réponse retirée).
    if (level && calls.length) {
      try {
        yield* applyLevelCalls(level, parsed(calls), recording);
      } catch (error) {
        serverLog.error('chat.level', error);
        yield { type: 'error', code: 'upstream' };
        return;
      }
    }
  }
  yield { type: 'done' };
}

/** Appels d'outils lisibles ; les autres sont journalisés et ignorés. */
function parsed(calls: readonly FunctionCall[]): LevelCall[] {
  const result: LevelCall[] = [];
  for (const call of calls) {
    const levelCall = parseLevelCall(call.name, call.arguments);
    if (levelCall) result.push(levelCall);
    else serverLog.warn('chat.tool_ignored', { name: call.name });
  }
  return result;
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
  const place = levelOfTopic(chat.value.topic);
  const levels = deps.levels?.() ?? unavailableLevelStore;
  if (place && levels === unavailableLevelStore) return errorResponse('not_allowed');

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

  let level: LevelContext | null = null;
  if (place) {
    try {
      const play = await levels.load(conversation.sessionId, studentId, place.level.id);
      level = { place, play: play ?? startPlay(place.level.id), store: levels };
    } catch (error) {
      serverLog.error('chat.level_load', error);
      return errorResponse('upstream');
    }
  }

  await recordMessage(admin, conversation, studentId, 'student', chat.value.message);
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)]);
  const safetyId = await sha256(studentId);
  const withHistory: ValidChat = { ...chat.value, history: conversation.history };
  return ndjsonResponse(
    streamReply(
      client,
      model,
      withHistory,
      safetyId,
      signal,
      { admin, conversation, studentId },
      level,
    ),
  );
}
