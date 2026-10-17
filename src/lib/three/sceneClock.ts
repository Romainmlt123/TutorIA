/*
 * Horloge des scènes 3D (secondes), tenue par l'app et non par R3F : R3F remet la sienne à zéro à
 * chaque changement de `frameloop` et à chaque nouveau Canvas, et les animations repartaient alors
 * du début (île qui réapparaît, avatar qui recommence sa marche). Celle-ci est un objet de module :
 * elle survit au Canvas recréé (Android) et à l'onglet caché, et seul le pilote des images
 * (`FrameDriver`) la fait avancer, avant chaque image. Elle est figée quand les animations sont
 * réduites.
 */

/** Même forme qu'un uniforme de shader : les matériaux animés (eau, herbe, nuages) la partagent. */
export type SceneClock = { value: number };

/** L'horloge commune aux scènes d'Explorer (eau, nuages, vent dans l'herbe, île qui flotte, avatar). */
export const SCENE_TIME: SceneClock = { value: 0 };

/** Fait avancer l'horloge de la durée de l'image (s), sauf si les animations sont réduites. */
export function advanceClock(clock: SceneClock, delta: number, animated: boolean): void {
  if (animated && Number.isFinite(delta) && delta > 0) clock.value += delta;
}
