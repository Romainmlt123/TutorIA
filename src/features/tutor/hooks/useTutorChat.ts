import { useCallback, useEffect, useReducer, useRef } from 'react';

import { chapterById } from '@/features/flashcards/logic/catalog';
import type { SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import { logError } from '@/lib/logger';
import { queryClient } from '@/lib/queryClient';
import { studyRulesKey } from '@/lib/session/useStudyRules';
import {
  tutorService,
  type TutorErrorCode,
  type TutorService,
  type TutorTopic,
} from '@/services/tutor';
import { PHOTO_NOTE, type LevelOutcome } from '@/services/tutor/api-contract';
import type { TutorVisual } from '@/services/tutor/visuals';

import { splitTip } from '../logic/conversations';

export type ChatMessage = {
  id: string;
  /** `step` : carte « Étape réussie » d'un niveau d'Explorer. */
  kind: 'tutor' | 'student' | 'tip' | 'step';
  text: string;
  streaming?: boolean;
  reported?: boolean;
  /** Visuel dessiné avec cette réponse du tuteur (graphique, diagramme, figure, tableau). */
  visual?: TutorVisual;
  /** Photo d'exercice envoyée par l'élève (data URL), montrée le temps de la discussion. */
  image?: string;
};

/** Avancement d'un niveau d'Explorer, annoncé par le serveur. */
export type LevelProgress = { done: number; total: number };

/** Niveau d'Explorer joué dans la discussion. */
export type LevelChat = {
  /** Premier message du tuteur. */
  opening: string;
  /** Texte de la carte affichée quand une étape est franchie (leçon) ; absent : aucune carte. */
  stepCard?: (done: number) => string;
};

type State = {
  messages: ChatMessage[];
  pending: boolean;
  /** Pas de réseau : la question de l'élève attend, sous la carte « Pas de connexion » (H1). */
  offline: Waiting | null;
  progress: LevelProgress | null;
  result: LevelOutcome | null;
  /** Dernier visuel du tuteur, affiché dans le panneau au-dessus de la discussion. */
  visual: TutorVisual | null;
};

/** Question restée sans réponse faute de réseau, renvoyée par « Réessayer ». */
type Waiting = { id: string; text: string; image?: string };

type Action =
  | { type: 'add'; message: ChatMessage }
  | { type: 'addBefore'; id: string; message: ChatMessage }
  | { type: 'delta'; id: string; text: string }
  | { type: 'finish'; id: string; tipId: string }
  | { type: 'replace'; id: string; text: string }
  | { type: 'remove'; id: string }
  | { type: 'pending'; pending: boolean }
  | { type: 'offline'; offline: Waiting | null }
  | { type: 'reported'; id: string }
  | { type: 'progress'; progress: LevelProgress }
  | { type: 'result'; result: LevelOutcome }
  | { type: 'visual'; id: string; visual: TutorVisual };

function reducer(state: State, action: Action): State {
  const update = (id: string, change: (m: ChatMessage) => ChatMessage) => ({
    ...state,
    messages: state.messages.map((m) => (m.id === id ? change(m) : m)),
  });
  switch (action.type) {
    case 'add':
      return { ...state, messages: [...state.messages, action.message] };
    case 'addBefore':
      return {
        ...state,
        messages: state.messages.flatMap((m) => (m.id === action.id ? [action.message, m] : [m])),
      };
    case 'delta':
      return update(action.id, (m) => ({ ...m, text: m.text + action.text }));
    case 'finish': {
      const message = state.messages.find((m) => m.id === action.id);
      if (!message) return state;
      const { answer, tip } = splitTip(message.text);
      const done = { ...message, text: answer, streaming: false };
      const messages = state.messages.flatMap((m) =>
        m.id !== action.id
          ? [m]
          : tip
            ? [done, { id: action.tipId, kind: 'tip' as const, text: tip }]
            : [done],
      );
      return { ...state, messages };
    }
    case 'replace':
      return update(action.id, (m) => ({ ...m, text: action.text, streaming: false }));
    case 'remove':
      return { ...state, messages: state.messages.filter((m) => m.id !== action.id) };
    case 'pending':
      return { ...state, pending: action.pending };
    case 'offline':
      return { ...state, offline: action.offline };
    case 'reported':
      return update(action.id, (m) => ({ ...m, reported: true }));
    case 'progress':
      return { ...state, progress: action.progress };
    case 'result':
      return { ...state, result: action.result };
    case 'visual':
      return {
        ...update(action.id, (m) => ({ ...m, visual: action.visual })),
        visual: action.visual,
      };
  }
}

function initialState(messages: readonly ChatMessage[]): State {
  return {
    messages: [...messages],
    pending: false,
    offline: null,
    progress: null,
    result: null,
    // Une discussion rouverte montre son dernier visuel.
    visual: messages.findLast((m) => m.visual)?.visual ?? null,
  };
}

/** Coupures du réseau : la question attend. Une erreur d'OpenAI (`upstream`) garde son message. */
const OFFLINE_CODES: readonly TutorErrorCode[] = ['network', 'timeout'];

function openingFor(topic: TutorTopic, level?: LevelChat): ChatMessage[] {
  if (level) return [{ id: 'opening-0', kind: 'tutor', text: level.opening }];
  const chapter = topic.chapterId ? chapterById(topic.chapterId) : undefined;
  const text = chapter ? fr.tutor.opening(chapter.title) : fr.tutor.freeOpening;
  return [{ id: 'opening-0', kind: 'tutor', text }];
}

export type TutorChatOptions = {
  topic: TutorTopic;
  service?: TutorService;
  /** Niveau d'Explorer joué dans la discussion. */
  level?: LevelChat;
  /** Discussion rouverte depuis le volet : son identifiant et ses messages enregistrés. */
  resume?: { conversationId: string; messages: readonly ChatMessage[] };
  /** Le serveur vient d'ouvrir la discussion (premier message envoyé). */
  onConversation?: (conversationId: string) => void;
  /** Le serveur a donné un titre à la discussion, avec sa matière s'il en a reconnu une. */
  onTitle?: (title: string, subjectId?: SubjectId) => void;
};

/**
 * Discussion écrite avec le tuteur : envoi, réponse en flux, erreurs bienveillantes, signalement.
 * Sans réseau, la question de l'élève attend et « Réessayer » la renvoie (H1, v2.19).
 * Pour un niveau d'Explorer (`topic.levelId`), elle suit aussi l'avancement et le bilan.
 * Une discussion dure le temps du composant : l'écran change de clé pour en ouvrir une autre.
 */
export function useTutorChat({
  topic,
  service = tutorService,
  level,
  resume,
  onConversation,
  onTitle,
}: TutorChatOptions) {
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    initialState(resume?.messages ?? openingFor(topic, level)),
  );
  const counter = useRef(0);
  const abort = useRef<AbortController | null>(null);
  const conversationId = useRef(resume?.conversationId);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => () => abort.current?.abort(), []);

  const nextId = () => `m${++counter.current}`;
  /**
   * Envoie une question au tuteur. `waiting` : la question restée sans réponse faute de réseau,
   * déjà affichée, renvoyée telle quelle.
   */
  const ask = useCallback(
    async (text: string, image?: string, waiting?: Waiting) => {
      const current = stateRef.current;
      if (current.pending || (!text && !image)) return;
      const studentId = waiting?.id ?? nextId();
      if (!waiting) {
        dispatch({
          type: 'add',
          message: { id: studentId, kind: 'student', text, ...(image ? { image } : {}) },
        });
      }
      dispatch({ type: 'offline', offline: null });

      const history = current.messages
        .filter(
          (m) => (m.kind === 'tutor' || m.kind === 'student') && !m.streaming && m.id !== studentId,
        )
        .map((m) => ({
          role: m.kind === 'student' ? ('student' as const) : ('tutor' as const),
          text: m.image ? [PHOTO_NOTE, m.text].filter(Boolean).join('\n') : m.text,
        }))
        .filter((turn) => turn.text);
      const id = nextId();
      const controller = new AbortController();
      abort.current = controller;
      dispatch({ type: 'pending', pending: true });
      dispatch({ type: 'add', message: { id, kind: 'tutor', text: '', streaming: true } });

      let received = false;
      let finished = false;
      try {
        for await (const event of service.sendMessage(
          {
            topic,
            history,
            message: text,
            conversationId: conversationId.current,
            ...(image ? { image } : {}),
          },
          controller.signal,
        )) {
          if (event.type === 'conversation') {
            conversationId.current = event.id;
            onConversation?.(event.id);
          } else if (event.type === 'title') {
            onTitle?.(event.title, event.subjectId);
          } else if (event.type === 'step') {
            const card = level?.stepCard?.(event.done);
            // La carte se place avant la réponse du tuteur, qui enchaîne sur l'étape suivante.
            if (card) {
              dispatch({
                type: 'addBefore',
                id,
                message: { id: nextId(), kind: 'step', text: card },
              });
            }
            dispatch({ type: 'progress', progress: { done: event.done, total: event.total } });
          } else if (event.type === 'visual') {
            dispatch({ type: 'visual', id, visual: event.visual });
          } else if (event.type === 'levelResult') {
            dispatch({ type: 'result', result: event.outcome });
          } else if (event.type === 'delta') {
            received = true;
            dispatch({ type: 'delta', id, text: event.text });
          } else if (event.type === 'retract') {
            dispatch({ type: 'replace', id, text: fr.tutor.errors.retracted });
            finished = true;
          } else if (event.type === 'done') {
            if (!finished) dispatch({ type: 'finish', id, tipId: nextId() });
            finished = true;
          } else if (OFFLINE_CODES.includes(event.code) && !received) {
            // La bulle vide disparaît ; la question reste, sous la carte « Pas de connexion ».
            dispatch({ type: 'remove', id });
            dispatch({
              type: 'offline',
              offline: { id: studentId, text, ...(image ? { image } : {}) },
            });
            finished = true;
          } else {
            const code =
              event.code === 'bad_request' || event.code === 'network' ? 'upstream' : event.code;
            dispatch({ type: 'replace', id, text: fr.tutor.errors[code] });
            // La pause vient de commencer : relire les règles bascule tout de suite sur l'écran de
            // pause, au lieu d'attendre la relecture de chaque minute.
            if (code === 'paused') void queryClient.invalidateQueries({ queryKey: studyRulesKey });
            finished = true;
          }
        }
        if (!finished && !controller.signal.aborted) {
          dispatch(
            received
              ? { type: 'finish', id, tipId: nextId() }
              : { type: 'replace', id, text: fr.tutor.errors.upstream },
          );
        }
      } catch (error) {
        logError('tutor.chat', error);
        dispatch({ type: 'replace', id, text: fr.tutor.errors.upstream });
      } finally {
        dispatch({ type: 'pending', pending: false });
      }
    },
    [level, onConversation, onTitle, service, topic],
  );

  const send = useCallback((text: string, image?: string) => ask(text, image), [ask]);

  /** « Réessayer » : la question restée en attente repart, sans être affichée une deuxième fois. */
  const retry = useCallback(() => {
    const waiting = stateRef.current.offline;
    if (waiting) void ask(waiting.text, waiting.image, waiting);
  }, [ask]);

  const report = useCallback(
    (id: string) => {
      const message = stateRef.current.messages.find((m) => m.id === id);
      if (!message || message.reported) return;
      dispatch({ type: 'reported', id });
      service
        .reportMessage(message.text, topic)
        .catch((error: unknown) => logError('tutor.report', error));
    },
    [service, topic],
  );

  return {
    messages: state.messages,
    pending: state.pending,
    offline: state.offline !== null,
    progress: state.progress,
    result: state.result,
    visual: state.visual,
    send,
    retry,
    report,
  };
}
