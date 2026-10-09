/*
 * Règles de modération sans dépendance : partagées par le serveur intermédiaire et par le
 * surveillant du vocal (monitor/), qui tourne sous Node sans le résolveur de modules d'Expo.
 */

/** Modèle de modération : la documentation OpenAI recommande de le passer explicitement. */
export const MODERATION_MODEL = 'omni-moderation-latest';

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
