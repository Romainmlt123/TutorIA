import type OpenAI from 'openai';

import { MODERATION_MODEL, verdictOf, type Verdict } from './moderationRules';

export { verdictOf, type Verdict };

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
