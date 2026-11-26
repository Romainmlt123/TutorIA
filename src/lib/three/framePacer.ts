/*
 * Rythme des images d'une scène 3D (fonctions pures, utilisées par `FrameDriver`) : 60 images par
 * seconde au plus, même sur un écran à 90 ou 120 Hz (ou moins, si la scène le demande), et, quand
 * les animations sont réduites, des images seulement quand quelque chose bouge.
 */

/** Intervalle visé entre deux images (ms), par défaut : 60 images par seconde. */
export const FRAME_INTERVAL_MS = 1000 / 60;
/**
 * Images encore dessinées après la dernière demande, quand les animations sont réduites : de quoi
 * laisser passer les effets de React (modèle chargé, texture envoyée) avant de s'arrêter.
 */
export const SETTLE_FRAMES = 3;

export type FramePacer = {
  /** Heure prévue (ms) de la prochaine image, ou null au démarrage. */
  due: number | null;
  /** Heure (ms) de la dernière image dessinée, ou null au démarrage. */
  last: number | null;
  /** Images encore demandées (animations réduites). */
  pending: number;
};

export function createPacer(): FramePacer {
  return { due: null, last: null, pending: 0 };
}

/**
 * Un battement de l'écran (`requestAnimationFrame`) à l'heure `now` (ms). Rend la durée (s) de
 * l'image à dessiner, ou null si ce battement est sauté. L'image suivante est prévue un intervalle
 * (`interval`, ms) après celle qui était prévue, et non après ce battement : le rythme ne dérive pas
 * (60 images par seconde tout rond à 90 Hz comme à 120 Hz). Après un retard de plus d'un intervalle
 * (image lente), le rythme repart de maintenant, sans rafale pour rattraper.
 *
 * Un battement peut arriver un quart d'intervalle avant l'heure prévue : les horodatages du fil JS
 * sont un peu irréguliers. À 120 Hz, le battement à sauter arrive un demi-intervalle trop tôt,
 * celui à dessiner presque à l'heure.
 */
export function pace(pacer: FramePacer, now: number, interval = FRAME_INTERVAL_MS): number | null {
  if (pacer.due !== null && now < pacer.due - interval / 4) return null;
  const delta = pacer.last === null ? interval : now - pacer.last;
  const next = (pacer.due ?? now) + interval;
  pacer.due = next > now ? next : now + interval;
  pacer.last = now;
  pacer.pending = Math.max(0, pacer.pending - 1);
  return delta / 1000;
}

/** Quelque chose a changé : la scène dessine encore au moins `frames` images. */
export function requestFrames(pacer: FramePacer, frames = SETTLE_FRAMES): void {
  pacer.pending = Math.max(pacer.pending, frames);
}

/** Vrai tant que la boucle doit tourner : animations jouées, ou images encore demandées. */
export function keepsRunning(pacer: FramePacer, animated: boolean): boolean {
  return animated || pacer.pending > 0;
}

/** La boucle s'arrête : au redémarrage, la première image ne compte pas la durée de la pause. */
export function rest(pacer: FramePacer): void {
  pacer.due = null;
  pacer.last = null;
  pacer.pending = 0;
}

/**
 * Vrai si la vue a changé depuis l'image précédente : `matrices` sont celles de la caméra (position
 * et projection), `memory` garde leurs valeurs d'une image à l'autre. Tant que la caméra bouge
 * (élan, retour dans les bornes, cadrage qui glisse), la scène redemande des images.
 */
export function viewChanged(memory: number[], matrices: readonly ArrayLike<number>[]): boolean {
  let changed = false;
  let k = 0;
  for (const values of matrices) {
    for (let i = 0; i < values.length; i++, k++) {
      if (memory[k] !== values[i]) {
        memory[k] = values[i]!;
        changed = true;
      }
    }
  }
  return changed;
}
