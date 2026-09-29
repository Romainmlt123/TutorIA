import { z } from 'zod';

import { chapters } from '@/data/mock/chapters';
import {
  TUTOR_LIMITS,
  type ChatTurn,
  type TutorErrorCode,
  type TutorTopic,
} from '@/services/tutor/api-contract';

import { levelOfTopic } from '../tutor/level';

const SUBJECT_IDS = [
  'maths',
  'francais',
  'histoire-geo',
  'anglais',
  'svt',
  'physique-chimie',
] as const;

const topicSchema = z.object({
  subjectId: z.enum(SUBJECT_IDS),
  chapterId: z.string().max(64),
  levelId: z.string().max(128).optional(),
});

const chatSchema = z.object({
  topic: topicSchema,
  history: z.array(z.object({ role: z.enum(['student', 'tutor']), text: z.string() })).max(200),
  message: z.string(),
});

export type ValidChat = { topic: TutorTopic; history: ChatTurn[]; message: string };

type Result<T> = { ok: true; value: T } | { ok: false; code: TutorErrorCode };

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const PHONE = /(?:\+33\s?|0)[1-9](?:[\s.-]?\d{2}){4}/g;

/** Retire les données personnelles évidentes (e-mail, téléphone) avant l'envoi à OpenAI. */
export function redactPersonalData(text: string): string {
  return text.replace(EMAIL, '[e-mail]').replace(PHONE, '[téléphone]');
}

/**
 * Le chapitre doit exister et appartenir à la matière annoncée. Pour un niveau d'Explorer, le niveau
 * doit exister, appartenir à ce chapitre et se jouer déjà.
 */
export function isKnownTopic(topic: TutorTopic): boolean {
  if (topic.levelId !== undefined) return levelOfTopic(topic) !== null;
  return chapters.some((c) => c.id === topic.chapterId && c.subjectId === topic.subjectId);
}

export function parseTopic(body: unknown): Result<TutorTopic> {
  const parsed = z.object({ topic: topicSchema }).safeParse(body);
  if (!parsed.success || !isKnownTopic(parsed.data.topic))
    return { ok: false, code: 'bad_request' };
  return { ok: true, value: parsed.data.topic };
}

/**
 * Valide une requête de discussion : longueur du message, rôles autorisés,
 * historique limité aux derniers tours et à un volume maximal (coût et vie privée).
 */
export function validateChat(body: unknown): Result<ValidChat> {
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success || !isKnownTopic(parsed.data.topic))
    return { ok: false, code: 'bad_request' };
  const message = parsed.data.message.trim();
  if (!message) return { ok: false, code: 'bad_request' };
  if (message.length > TUTOR_LIMITS.messageMaxChars) return { ok: false, code: 'too_long' };

  const history: ChatTurn[] = [];
  let total = message.length;
  for (const turn of parsed.data.history.slice(-TUTOR_LIMITS.historyMaxTurns).reverse()) {
    const text = turn.text.trim().slice(0, 600);
    if (!text || total + text.length > TUTOR_LIMITS.historyMaxChars) break;
    total += text.length;
    history.unshift({ role: turn.role, text: redactPersonalData(text) });
  }
  return {
    ok: true,
    value: { topic: parsed.data.topic, history, message: redactPersonalData(message) },
  };
}
