import OpenAI from 'openai';

import { getServerEnv } from './env';

let client: OpenAI | null = null;

/** Client OpenAI du serveur : le seul endroit du dépôt qui utilise la clé. */
export function getOpenAI(): OpenAI {
  client ??= new OpenAI({ apiKey: getServerEnv().apiKey, timeout: 20_000, maxRetries: 1 });
  return client;
}
