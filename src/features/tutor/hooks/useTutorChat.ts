import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import { cardsOfChapter, chapterById } from '@/features/flashcards/logic/catalog';
import type { SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import { logError } from '@/lib/logger';
import {
  tutorService,
  type TutorErrorCode,
  type TutorService,
  type TutorTopic,
} from '@/services/tutor';
import { PHOTO_NOTE, type LevelOutcome } from '@/services/tutor/api-contract';
import type { TutorVisual } from '@/services/tutor/visuals';
import { checkPracticeAnswer, practiceQuestion } from '@/services/tutor/mock/practice';

import { splitTip } from '../logic/conversations';

export type ChatMessage = {
  id: string;
  /** `step` : carte « Étape réussie » d'un niveau d'Explorer. */
  kind: 'tutor' | 'student' | 'tip' | 'step';
  text: string;
  streaming?: boolean;
  /** Question ou retour d'entraînement du mode hors ligne. */
  practice?: boolean;
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
  offline: boolean;
  practiceIndex: number;
  progress: LevelProgress | null;
  result: LevelOutcome | null;
  /** Dernier visuel du tuteur, affiché dans le panneau au-dessus de la discussion. */
  visual: TutorVisual | null;
};

type Action =
  | { type: 'add'; message: ChatMessage }
  | { type: 'addBefore'; id: string; message: ChatMessage }
  | { type: 'delta'; id: string; text: string }
  | { type: 'finish'; id: string; tipId: string }
  | { type: 'replace'; id: string; text: string }
  | { type: 'remove'; id: string }
  | { type: 'pending'; pending: boolean }
  | { type: 'offline'; offline: boolean }
  | { type: 'nextPractice' }
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
    case 'nextPractice':
      return { ...state, practiceIndex: state.practiceIndex + 1 };
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
    offline: false,
    practiceIndex: 0,
    progress: null,
    result: null,
    // Une discussion rouverte montre son dernier visuel.
    visual: messages.findLast((m) => m.visual)?.visual ?? null,
  };
}

const OFFLINE_CODES: readonly TutorErrorCode[] = ['network', 'timeout', 'upstream'];

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
 * Discussion écrite avec le tuteur : envoi, réponse en flux, erreurs bienveillantes,
 * signalement, et bascule en mode hors ligne assumé (questions d'entraînement du chapitre).
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
  const practiceCards = useMemo(
    () => (topic.chapterId ? cardsOfChapter(topic.chapterId) : []),
    [topic.chapterId],
  );

  const askPractice = useCallback(
    (index: number) => {
      const card = practiceCards[index % Math.max(practiceCards.length, 1)];
      if (card)
        dispatch({
          type: 'add',
          message: { id: nextId(), kind: 'tutor', text: practiceQuestion(card), practice: true },
        });
    },
    [practiceCards],
  );

  const send = useCallback(
    async (text: string, image?: string) => {
      const current = stateRef.current;
      if (current.pending || (!text && !image)) return;
      dispatch({
        type: 'add',
        message: { id: nextId(), kind: 'student', text, ...(image ? { image } : {}) },
      });

      // Hors ligne, l'entraînement ne lit que le texte (le bouton photo y est masqué).
      if (current.offline) {
        const card = practiceCards[current.practiceIndex % Math.max(practiceCards.length, 1)];
        if (!card) return;
        const result = checkPracticeAnswer(card, text);
        dispatch({
          type: 'add',
          message: { id: nextId(), kind: 'tutor', text: result.text, practice: true },
        });
        dispatch({ type: 'nextPractice' });
        askPractice(current.practiceIndex + 1);
        return;
      }

      const history = current.messages
        .filter((m) => (m.kind === 'tutor' || m.kind === 'student') && !m.practice && !m.streaming)
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
          } else if (OFFLINE_CODES.includes(event.code) && !received && practiceCards.length > 0) {
            dispatch({ type: 'remove', id });
            dispatch({ type: 'offline', offline: true });
            askPractice(stateRef.current.practiceIndex);
            finished = true;
          } else {
            const code =
              event.code === 'bad_request' || event.code === 'network' ? 'upstream' : event.code;
            dispatch({ type: 'replace', id, text: fr.tutor.errors[code] });
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
    [askPractice, level, onConversation, onTitle, practiceCards, service, topic],
  );

  const retry = useCallback(() => dispatch({ type: 'offline', offline: false }), []);

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
    offline: state.offline,
    progress: state.progress,
    result: state.result,
    visual: state.visual,
    send,
    retry,
    report,
  };
}
