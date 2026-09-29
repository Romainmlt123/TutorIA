export type RateLimit = { windowMs: number; max: number };

/**
 * Limite de débit à fenêtre glissante, en mémoire.
 * Suffisant en développement et sur un seul serveur ; en production serverless (EAS Hosting),
 * il faudra un stockage partagé (voir CLAUDE.md, points de vigilance).
 */
export function createRateLimiter(
  limits: readonly RateLimit[],
  store = new Map<string, number[]>(),
) {
  const hits = store;
  const longest = Math.max(...limits.map((l) => l.windowMs));

  return {
    /** Enregistre une requête ; renvoie `false` si une des limites est atteinte. */
    consume(key: string, now = Date.now()): boolean {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < longest);
      const blocked = limits.some(
        (limit) => recent.filter((t) => now - t < limit.windowMs).length >= limit.max,
      );
      if (!blocked) recent.push(now);
      hits.set(key, recent);
      if (hits.size > 10_000) {
        for (const [k, times] of hits) if (times.every((t) => now - t >= longest)) hits.delete(k);
      }
      return !blocked;
    },
  };
}

/*
 * Le serveur de développement d'Expo réévalue les routes API à chaque requête :
 * l'état est donc rangé sur `globalThis`, partagé par le processus.
 */
const globalStore = globalThis as typeof globalThis & {
  __tutoriaRateLimits?: Map<string, Map<string, number[]>>;
};
globalStore.__tutoriaRateLimits ??= new Map();

function sharedLimiter(name: string, limits: readonly RateLimit[]) {
  const stores = globalStore.__tutoriaRateLimits!;
  if (!stores.has(name)) stores.set(name, new Map());
  return createRateLimiter(limits, stores.get(name));
}

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

/** Limites par route : par installation et par adresse IP. */
export const limiters = {
  chatClient: sharedLimiter('chatClient', [
    { windowMs: 10 * MINUTE, max: 20 },
    { windowMs: DAY, max: 150 },
  ]),
  chatIp: sharedLimiter('chatIp', [{ windowMs: 10 * MINUTE, max: 60 }]),
  voiceClient: sharedLimiter('voiceClient', [
    { windowMs: MINUTE, max: 1 },
    { windowMs: DAY, max: 5 },
  ]),
  voiceIp: sharedLimiter('voiceIp', [{ windowMs: DAY, max: 20 }]),
  imageClient: sharedLimiter('imageClient', [
    { windowMs: 10 * MINUTE, max: 3 },
    { windowMs: DAY, max: 10 },
  ]),
  reportClient: sharedLimiter('reportClient', [{ windowMs: 10 * MINUTE, max: 10 }]),
};
