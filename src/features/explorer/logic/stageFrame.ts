/*
 * Cadrage de l'île dans le carrousel (X1) : l'île doit tenir dans la zone libre entre la pastille
 * de la matière et les points, quels que soient l'écran, la zone sûre et la taille du texte.
 */

/** Cadrage transmis à la caméra : hauteur de sa visée à l'écran et largeur de l'île, en fractions. */
export type IslandFrame = { aimY: number; fill: number };

/** Cadrage de départ, avant la première mesure de la zone. */
export const DEFAULT_FRAME: IslandFrame = { aimY: 0.44, fill: 0.74 };

/** Largeur maximale de l'île : il reste de la place pour les flèches de part et d'autre. */
export const MAX_FILL = 0.8;
/** Hauteur visible de l'île (du haut de la grue à la pointe de la motte), en largeurs d'île. */
export const ISLAND_HEIGHT = 1.05;
/**
 * La caméra vise le cœur de l'île, sous le plateau : ce point est plus bas que le centre visuel
 * de l'île (grue comprise), de 0,18 largeur d'île.
 */
export const AIM_BELOW_CENTER = 0.18;

type Box = { top: number; height: number };

export function frameFor(zone: Box, screen: { width: number; height: number }): IslandFrame {
  if (zone.height <= 0 || screen.width <= 0 || screen.height <= 0) return DEFAULT_FRAME;
  const width = Math.min(MAX_FILL * screen.width, zone.height / ISLAND_HEIGHT);
  const aim = zone.top + zone.height / 2 + AIM_BELOW_CENTER * width;
  return { aimY: aim / screen.height, fill: width / screen.width };
}
