import type OpenAI from 'openai';

import { MODERATION_MODEL } from '../env';

export type Verdict = 'ok' | 'flagged' | 'distress';

type ModerationResult = { flagged: boolean; categories: object };

const DISTRESS_CATEGORIES = ['self-harm', 'self-harm/intent', 'self-harm/instructions'];

/** Détresse (automutilation) : message d'aide ; autre contenu signalé : on revient aux révisions. */
export function verdictOf(result: ModerationResult | undefined): Verdict {
  if (!result) return 'ok';
  const categories = result.categories as Record<string, boolean | undefined>;
  if (DISTRESS_CATEGORIES.some((name) => categories[name])) return 'distress';
  return result.flagged ? 'flagged' : 'ok';
}

type Moderator = Pick<OpenAI, 'moderations'>;

export async function moderateText(openai: Moderator, text: string): Promise<Verdict> {
  const response = await openai.moderations.create({ model: MODERATION_MODEL, input: text });
  return verdictOf(response.results[0]);
}

export async function moderateImage(openai: Moderator, dataUrl: string): Promise<Verdict> {
  const response = await openai.moderations.create({
    model: MODERATION_MODEL,
    input: [{ type: 'image_url', image_url: { url: dataUrl } }],
  });
  return verdictOf(response.results[0]);
}
