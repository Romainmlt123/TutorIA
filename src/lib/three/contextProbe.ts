/**
 * Nom d'une extension WebGL qui n'existe dans aucun pilote. expo-gl (57.0.2) y répond `null` tant
 * que le contexte vit, et `undefined` une fois qu'il est détruit, comme à tout autre appel : il ne
 * le retrouve plus. La réponse vient d'une liste gardée en mémoire, sans travail sur le fil GL.
 * `isContextLost()` ne sert à rien ici : expo-gl répond toujours faux.
 */
export const PROBE_EXTENSION = '__probe__';

/**
 * Vrai si le contexte 3D d'expo-gl est détruit (natif seulement : sur le web, un navigateur répond
 * toujours `null`). Android le détruit quand la vue 3D quitte la fenêtre : dessiner dedans ferait
 * échouer chaque image (« WeakMap key must be an Object »).
 */
export function isContextDead(context: { getExtension(name: string): unknown }): boolean {
  return context.getExtension(PROBE_EXTENSION) === undefined;
}
