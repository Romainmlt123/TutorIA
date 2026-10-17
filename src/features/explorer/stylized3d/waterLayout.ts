import layout from './water.json';

/*
 * Tracé de l'eau de l'île des Maths (water.json), sans three.js : l'eau animée de la 3D (water.ts)
 * et les reflets de la carte pré-rendue d'une région (logic/ambientLayout.ts) le lisent. Repère de
 * l'île : x vers la droite, z vers la caméra, en mètres ; le plateau est à y = 0.
 */

/** Hauteur de l'eau, juste au-dessus des bosses du plateau (±0,015, lib/geo.py) : Blender la reprend (lib/mapwater.py). */
export const WATER_SURFACE = 0.022;

/** Contour du bassin en π, sommet par sommet ([x, z]). */
export function piPoints(): [number, number][] {
  const { origin, shape } = layout.pi;
  return shape.map(([x, y]) => [origin.x + x! * origin.sx, origin.z - y! * origin.sz]);
}
