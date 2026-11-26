/**
 * Direction du soleil cuit dans les modèles (tools/explorer-3d/lib/bake.py), repère de l'app, non
 * normée : l'eau, les ombres au sol et les points de niveau s'éclairent comme le décor cuit, et la
 * carte pré-rendue la transmet à Blender (mapExport). Module pur : aucune dépendance à three.js.
 */
export const SUN_DIRECTION = [-0.67, 0.656, 0.348] as const;

/**
 * Ombre douce posée au sol sous un objet de la carte : son décalage horizontal (mètres) par mètre de
 * hauteur de l'objet, à l'opposé du soleil cuit (groundShadows, et l'ombre de l'avatar sur la carte
 * pré-rendue).
 */
export const SHADOW_FALL = {
  x: (-SUN_DIRECTION[0] / SUN_DIRECTION[1]) * 0.35,
  z: (-SUN_DIRECTION[2] / SUN_DIRECTION[1]) * 0.35,
} as const;
