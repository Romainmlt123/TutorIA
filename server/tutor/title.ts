import type OpenAI from 'openai';
import { z } from 'zod';

import type { SubjectId } from '@/data/types';

import { SUBJECT_IDS } from '../guards/limits';
import { moderateText } from '../guards/moderation';
import { serverLog } from '../log';

type TitleClient = Pick<OpenAI, 'moderations' | 'responses'>;

/** Longueur maximale d'un titre (même borne qu'en base, avec de la marge). */
const MAX_TITLE = 60;
const TITLE_TIMEOUT_MS = 8_000;

const NO_SUBJECT = 'aucune';

const INSTRUCTIONS = [
  'Tu donnes un titre à une discussion de révision scolaire entre un élève et son tuteur, et tu reconnais sa matière.',
  "Le titre : 2 à 6 mots, en français, qui nomment la notion travaillée (par exemple « Pythagore : l'hypoténuse » ou « Accorder le participe passé »). Pas de guillemets, pas de point final, aucun prénom ni aucune information personnelle.",
  `La matière : celle du collège dont relève la notion (${SUBJECT_IDS.join(', ')}), ou « ${NO_SUBJECT} » si la discussion mélange plusieurs matières ou sort du programme.`,
].join(' ');

const NAME_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    subject: { type: 'string', enum: [...SUBJECT_IDS, NO_SUBJECT] },
  },
  required: ['title', 'subject'],
  additionalProperties: false,
} as const;

const named = z.object({
  title: z.string(),
  subject: z.enum([...SUBJECT_IDS, NO_SUBJECT]),
});

/** Titre d'une discussion, et sa matière quand le modèle en reconnaît une seule. */
export type ConversationName = { title: string; subjectId?: SubjectId };

/** Titre propre : une ligne, sans guillemets ni point final, borné. */
export function cleanTitle(raw: string): string {
  const line = raw.split('\n').find((l) => l.trim()) ?? '';
  const title = line
    .trim()
    .replace(/^[«"“'\s]+|[»"”'\s.]+$/g, '')
    .replace(/\s+/g, ' ');
  return title.length > MAX_TITLE ? `${title.slice(0, MAX_TITLE - 1).trimEnd()}…` : title;
}

/** Repli : le début de la question de l'élève (déjà modérée), coupé proprement. */
export function fallbackTitle(question: string): string {
  const words = question.trim().replace(/\s+/g, ' ');
  if (words.length <= 40) return cleanTitle(words);
  const cut = words.slice(0, 40);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 20 ? cut.lastIndexOf(' ') : 40).trimEnd()}…`;
}

/**
 * Titre et matière d'une discussion, d'après la question et la réponse du tuteur, en un seul appel
 * (sortie structurée) ; le titre est modéré. Jamais d'échec : le repli reprend le début de la
 * question, sans matière.
 */
export async function nameOf(
  client: TitleClient,
  model: string,
  question: string,
  answer: string,
  safetyId: string,
): Promise<ConversationName> {
  try {
    const response = await client.responses.create(
      {
        model,
        instructions: INSTRUCTIONS,
        input: `Question de l'élève : ${question}\nRéponse du tuteur : ${answer.slice(0, 600)}`,
        text: {
          format: {
            type: 'json_schema',
            name: 'conversation_name',
            strict: true,
            schema: NAME_SCHEMA,
          },
        },
        max_output_tokens: 800,
        store: false,
        safety_identifier: safetyId,
      },
      { signal: AbortSignal.timeout(TITLE_TIMEOUT_MS) },
    );
    if (response.status === 'incomplete') throw new Error('Titre coupé par la limite de jetons');
    const parsed = named.safeParse(JSON.parse(response.output_text ?? ''));
    if (!parsed.success) throw new Error('Titre mal formé');
    const title = cleanTitle(parsed.data.title);
    const subject = parsed.data.subject;
    const subjectId = subject === NO_SUBJECT ? undefined : subject;
    if (title && (await moderateText(client, title)) === 'ok') {
      return subjectId ? { title, subjectId } : { title };
    }
    // Titre refusé par la modération : la matière reconnue reste valable.
    return subjectId
      ? { title: fallbackTitle(question), subjectId }
      : { title: fallbackTitle(question) };
  } catch (error) {
    serverLog.warn('tutor.title', { reason: error instanceof Error ? error.message : 'unknown' });
  }
  return { title: fallbackTitle(question) };
}
