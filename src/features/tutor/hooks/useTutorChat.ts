import { useCallback, useEffect, useReducer, useRef } from 'react';

import { openingConversation } from '@/data/mock/tutorConversation';
import { cardsOfChapter, chapterById } from '@/features/flashcards/logic/catalog';
import { fr } from '@/i18n/fr';
import { logError } from '@/lib/logger';
import {
  tutorService,
  type TutorErrorCode,
  type TutorService,
  type TutorTopic,
} from '@/services/tutor';
import { checkPracticeAnswer, practiceQuestion } from '@/services/tutor/mock/practice';

export type ChatMessage = {
  id: string;
  kind: 'tutor' | 'student' | 'tip';
  text: string;
  streaming?: boolean;
  /** Question ou retour d'entraînement du mode hors ligne. */
  practice?: boolean;
  reported?: boolean;
};

type State = { messages: ChatMessage[]; pending: boolean; offline: boolean; practiceIndex: number };

type Action =
  | { type: 'reset'; messages: ChatMessage[] }
  | { type: 'add'; message: ChatMessage }
  | { type: 'delta'; id: string; text: string }
  | { type: 'finish'; id: string; tipId: string }
  | { type: 'replace'; id: string; text: string }
  | { type: 'remove'; id: string }
  | { type: 'pending'; pending: boolean }
  | { type: 'offline'; offline: boolean }
  | { type: 'nextPractice' }
  | { type: 'reported'; id: string };

/** Un conseil de méthode peut suivre la réponse, sur une ligne « Conseil : … ». */
const TIP_LINE = /\n+\s*Conseil\s*:\s*/i;

function reducer(state: State, action: Action): State {
  const update = (id: string, change: (m: ChatMessage) => ChatMessage) => ({
    ...state,
    messages: state.messages.map((m) => (m.id === id ? change(m) : m)),
  });
  switch (action.type) {
    case 'reset':
      return { messages: action.messages, pending: false, offline: false, practiceIndex: 0 };
    case 'add':
      return { ...state, messages: [...state.messages, action.message] };
    case 'delta':
      return update(action.id, (m) => ({ ...m, text: m.text + action.text }));
    case 'finish': {
      const message = state.messages.find((m) => m.id === action.id);
      if (!message) return state;
      const [answer = '', tip] = message.text.split(TIP_LINE);
      const done = { ...message, text: answer.trim(), streaming: false };
      const messages = state.messages.flatMap((m) =>
        m.id !== action.id
          ? [m]
          : tip?.trim()
            ? [done, { id: action.tipId, kind: 'tip' as const, text: tip.trim() }]
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
  }
}

const OFFLINE_CODES: readonly TutorErrorCode[] = ['network', 'timeout', 'upstream'];

function openingFor(topic: TutorTopic, isResume: boolean): ChatMessage[] {
  if (isResume) {
    return openingConversation.map((m, i) => ({ id: `opening-${i}`, kind: m.role, text: m.text }));
  }
  const title = chapterById(topic.chapterId)?.title ?? '';
  return [{ id: 'opening-0', kind: 'tutor', text: fr.tutor.opening(title) }];
}

/**
 * Conversation écrite avec le tuteur : envoi, réponse en flux, erreurs bienveillantes,
 * signalement, et bascule en mode hors ligne assumé (questions d'entraînement du chapitre).
 */
export function useTutorChat(
  topic: TutorTopic,
  isResume: boolean,
  service: TutorService = tutorService,
) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    messages: openingFor(topic, isResume),
    pending: false,
    offline: false,
    practiceIndex: 0,
  }));
  const counter = useRef(0);
  const abort = useRef<AbortController | null>(null);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const nextId = () => `m${++counter.current}`;
  const practiceCards = cardsOfChapter(topic.chapterId);

  useEffect(() => {
    dispatch({ type: 'reset', messages: openingFor(topic, isResume) });
    return () => abort.current?.abort();
    // Nouvelle conversation à chaque changement de chapitre.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic.chapterId]);

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
    async (text: string) => {
      const current = stateRef.current;
      if (current.pending) return;
      dispatch({ type: 'add', message: { id: nextId(), kind: 'student', text } });

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
          text: m.text,
        }));
      const id = nextId();
      const controller = new AbortController();
      abort.current = controller;
      dispatch({ type: 'pending', pending: true });
      dispatch({ type: 'add', message: { id, kind: 'tutor', text: '', streaming: true } });

      let received = false;
      let finished = false;
      try {
        for await (const event of service.sendMessage(
          { topic, history, message: text },
          controller.signal,
        )) {
          // L'identifiant de conversation est géré par le service ; rien à afficher.
          if (event.type === 'conversation') continue;
          if (event.type === 'delta') {
            received = true;
            dispatch({ type: 'delta', id, text: event.text });
          } else if (event.type === 'retract') {
            dispatch({ type: 'replace', id, text: fr.tutor.errors.retracted });
            finished = true;
          } else if (event.type === 'done') {
            if (!finished) dispatch({ type: 'finish', id, tipId: nextId() });
            finished = true;
          } else if (OFFLINE_CODES.includes(event.code) && !received) {
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
    [askPractice, practiceCards, service, topic],
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
    send,
    retry,
    report,
  };
}
