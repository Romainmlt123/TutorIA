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
import {
  PHOTO_CAPTION,
  PHOTO_NOTE,
  TUTOR_LIMITS,
  type TutorStreamEvent,
} from '@/services/tutor/api-contract';

import { getServerEnv, ServerConfigError } from '../env';
import { moderateImage, moderateText } from '../guards/moderation';
import { limiters } from '../guards/rateLimit';
import { validateChat, type ValidChat } from '../guards/limits';
import { errorResponse, identify, ndjsonResponse, readJsonBody, sha256 } from '../http';
import { serverLog } from '../log';
import { getOpenAI } from '../openai';
import { getAdminClient, type AdminClient } from '../supabase';
import { consumeImageLimit, requireTutorAccess } from './access';
import {
  openConversation,
  recordMessage,
  nameConversation,
  type Conversation,
} from './conversation';
import type { TutorVisual } from '@/services/tutor/visuals';

import { LEVEL_TOOLS, levelInstructions, levelOfTopic, type LevelStore } from './level';
import { supabaseLevelStore } from './levelStore';
import { buildTutorInstructions, TUTOR_PROMPT_VERSION } from './prompt';
import { nameOf } from './title';
import { promptContextOf } from './topic';
import { parseVisualCall, VISUAL_TOOL_NAMES, VISUAL_TOOLS, visualText } from './visuals';

/** Délai maximal d'un passage du modèle (une réponse peut en demander deux). */
const UPSTREAM_TIMEOUT_MS = 20_000;
/** Réponses courtes par consigne ; la marge couvre un éventuel raisonnement du modèle. */
const MAX_OUTPUT_TOKENS = 800;
/** Une étape de leçon explique, illustre et résout un exemple : elle a besoin de plus de place. */
const MAX_LESSON_OUTPUT_TOKENS = 1500;

type ChatClient = Pick<OpenAI, 'moderations' | 'responses'>;

export type ChatDeps = {
  openai: () => ChatClient;
  textModel: () => string;
  admin: () => AdminClient;
  /** Enregistrement des niveaux d'Explorer. */
  levels: (admin: AdminClient) => LevelStore;
};

const defaultDeps: ChatDeps = {
  openai: getOpenAI,
  textModel: () => getServerEnv().textModel,
  admin: getAdminClient,
  levels: supabaseLevelStore,
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
    // L'XP annoncée est celle réellement accordée (rejouer ne rapporte que les étoiles nouvelles).
    const xp = await store.finish(sessionId, recording.studentId, place, turn.outcome);
    yield { type: 'levelResult', outcome: { ...turn.outcome, xp } };
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
  /** Le parent laisse le tuteur dessiner (graphiques et tableau blanc, P4). */
  visuals: boolean,
): AsyncGenerator<TutorStreamEvent> {
  if (recording.conversation.created) {
    yield { type: 'conversation', id: recording.conversation.id };
  }
  const context = promptContextOf(chat.topic, 'text');
  const lesson = level?.place.level.type === 'lecon';
  const instructions = buildTutorInstructions(
    level
      ? {
          ...context,
          level: levelInstructions(level.place, level.play, 'text'),
          lesson,
          visuals,
        }
      : { ...context, visuals },
  );
  const tools = [
    ...(level && !level.play.finished ? LEVEL_TOOLS : []),
    ...(visuals ? VISUAL_TOOLS : []),
  ];
  const maxOutputTokens = lesson ? MAX_LESSON_OUTPUT_TOKENS : MAX_OUTPUT_TOKENS;
  let input: ModelInput = [
    ...chat.history.map((turn) => ({
      role: turn.role === 'student' ? ('user' as const) : ('assistant' as const),
      content: turn.text,
    })),
    {
      role: 'user' as const,
      // Photo d'exercice : envoyée au modèle avec le message, jamais enregistrée.
      content: chat.image
        ? [
            { type: 'input_text' as const, text: chat.message || PHOTO_CAPTION },
            { type: 'input_image' as const, image_url: chat.image, detail: 'auto' as const },
          ]
        : chat.message,
    },
  ];
  let text = '';
  const calls: FunctionCall[] = [];
  let roundSignal = signal;
  try {
    for (let round = 0; round < MAX_MODEL_ROUNDS; round++) {
      roundSignal = AbortSignal.any([signal, AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)]);
      const roundCalls: FunctionCall[] = [];
      const stream = await client.responses.create(
        {
          model,
          instructions,
          input,
          ...(tools.length && round === 0 ? { tools, tool_choice: 'auto' as const } : {}),
          stream: true,
          store: false,
          max_output_tokens: maxOutputTokens,
          safety_identifier: safetyId,
          prompt_cache_key: `tutoria-tutor-${TUTOR_PROMPT_VERSION}`,
        },
        { signal: roundSignal },
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
      // Le modèle n'a fait qu'appeler un outil : on lui renvoie le résultat pour qu'il réponde.
      if (text || !roundCalls.length) break;
      input = [
        ...input,
        ...roundCalls,
        ...roundCalls.map((call) => ({
          type: 'function_call_output' as const,
          call_id: call.call_id,
          output: JSON.stringify(toolOutput(call, calls, level)),
        })),
      ];
    }
  } catch (error) {
    serverLog.error('chat.stream', error);
    yield { type: 'error', code: roundSignal.aborted ? 'timeout' : 'upstream' };
    return;
  }

  // Le premier visuel valide du message (un seul par message) ; les autres sont ignorés.
  const visual = visuals ? firstVisual(calls) : null;
  // Modération de la réponse complète, visuel compris : si elle est signalée, l'app la retire (et
  // rien n'est gardé).
  let kept = Boolean(text);
  try {
    const moderated = visual ? `${text}\n${visualText(visual)}` : text;
    if (text && (await moderateText(client, moderated)) !== 'ok') {
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
      visual,
    );
    if (visual) yield { type: 'visual', visual };
    // Une discussion libre sans titre (nouvelle, ou d'avant les titres) en reçoit un, pour le volet.
    if (recording.conversation.untitled && !level) {
      const question = chat.message || PHOTO_CAPTION;
      const { title, subjectId } = await nameOf(client, model, question, text, safetyId);
      // La matière reconnue ne remplace jamais celle d'une discussion qui en a déjà une.
      const { topic } = recording.conversation;
      const detected = topic.subjectId || topic.chapterId ? undefined : subjectId;
      await nameConversation(recording.admin, recording.conversation, title, detected);
      yield detected ? { type: 'title', title, subjectId: detected } : { type: 'title', title };
    }
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

/** Premier visuel valide parmi les appels du message ; un visuel mal formé est journalisé. */
function firstVisual(calls: readonly FunctionCall[]): TutorVisual | null {
  for (const call of calls) {
    if (!VISUAL_TOOL_NAMES.has(call.name)) continue;
    const visual = parseVisualCall(call.name, call.arguments);
    if (visual) return visual;
    serverLog.warn('chat.visual_invalid', { name: call.name });
  }
  return null;
}

/** Réponse renvoyée au modèle pour un appel d'outil, quand il n'a rien écrit d'autre. */
function toolOutput(
  call: FunctionCall,
  calls: readonly FunctionCall[],
  level: LevelContext | null,
) {
  if (VISUAL_TOOL_NAMES.has(call.name)) {
    return parseVisualCall(call.name, call.arguments)
      ? { affiche: true }
      : { affiche: false, raison: 'visuel mal formé : explique sans lui' };
  }
  if (!level) return { ignore: true };
  const play = applyCalls(level.place.level, level.play, parsed(calls)).play;
  return { enregistre: true, avancement: progressOf(level.place.level, play) };
}

/** Appels d'outils de niveau lisibles ; les autres (hors visuels) sont journalisés et ignorés. */
function parsed(calls: readonly FunctionCall[]): LevelCall[] {
  const result: LevelCall[] = [];
  for (const call of calls) {
    if (VISUAL_TOOL_NAMES.has(call.name)) continue;
    const levelCall = parseLevelCall(call.name, call.arguments);
    if (levelCall) result.push(levelCall);
    else serverLog.warn('chat.tool_ignored', { name: call.name });
  }
  return result;
}

/**
 * Photo d'exercice jointe (C4) : autorisée par le parent (caméra), jamais dans une évaluation
 * d'Explorer, et dans la limite des photos. Rend la réponse d'erreur, ou null si elle passe.
 */
async function refuseImage(
  request: Request,
  admin: AdminClient,
  studentId: string,
  place: LevelPlace | null,
  cameraEnabled: boolean,
): Promise<Response | null> {
  if (!cameraEnabled || place?.level.type === 'evaluation') return errorResponse('not_allowed');
  const { clientId } = identify(request);
  if (clientId && !limiters.imageClient.consume(clientId)) return errorResponse('rate_limited');
  const verdict = await consumeImageLimit(admin, studentId);
  if (verdict === 'allowed') return null;
  return errorResponse(verdict === 'limited' ? 'rate_limited' : 'upstream');
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
    // Une photo d'exercice (200 Ko au plus) peut accompagner le message.
    body = await readJsonBody(request, 32_000 + TUTOR_LIMITS.imageMaxBytes);
  } catch {
    return errorResponse('bad_request');
  }
  const chat = validateChat(body);
  if (!chat.ok) return errorResponse(chat.code);
  const place = levelOfTopic(chat.value.topic);
  const { image } = chat.value;
  if (image) {
    const refused = await refuseImage(request, admin, studentId, place, access.cameraEnabled);
    if (refused) return refused;
  }

  try {
    const verdict = chat.value.message ? await moderateText(client, chat.value.message) : 'ok';
    if (verdict !== 'ok') {
      serverLog.warn('chat.input', { verdict });
      return errorResponse(verdict);
    }
    const imageVerdict = image ? await moderateImage(client, image) : 'ok';
    if (imageVerdict !== 'ok') {
      serverLog.warn('chat.image', { verdict: imageVerdict });
      return errorResponse(imageVerdict);
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
      const store = deps.levels(admin);
      const play = await store.load(conversation.sessionId, studentId, place.level.id);
      level = { place, play: play ?? startPlay(place.level.id), store };
    } catch (error) {
      serverLog.error('chat.level_load', error);
      return errorResponse('upstream');
    }
  }

  // La photo n'est jamais gardée : seule une mention la remplace dans l'historique.
  const recorded = image
    ? [PHOTO_NOTE, chat.value.message].filter(Boolean).join('\n')
    : chat.value.message;
  await recordMessage(admin, conversation, studentId, 'student', recorded);
  const signal = request.signal;
  const safetyId = await sha256(studentId);
  // Une discussion rouverte garde le sujet enregistré avec elle.
  const withHistory: ValidChat = {
    ...chat.value,
    topic: conversation.topic,
    history: conversation.history,
  };
  return ndjsonResponse(
    streamReply(
      client,
      model,
      withHistory,
      safetyId,
      signal,
      { admin, conversation, studentId },
      level,
      access.visualsEnabled,
    ),
  );
}
