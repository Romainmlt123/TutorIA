import { BROW_STYLES, EYE_STYLES, MOUTH_STYLES, NOSE_STYLES, type AvatarLook } from './avatarLook';

/*
 * Réglages du visage tels que les lit le shader de la tête (avatar3d/faceMaterial.ts) : chaque
 * forme devient son rang, les curseurs de 0 à 1 deviennent des positions sur la face. Repère du
 * visage : la tête ramenée à une sphère de rayon 1, x vers la gauche du personnage, y vers le haut.
 */

/** Écart des yeux (demi-distance entre leurs centres) et hauteur de leur centre, aux deux bouts du curseur. */
export const EYE_SPACING: readonly [number, number] = [0.27, 0.41];
export const EYE_HEIGHT: readonly [number, number] = [-0.08, 0.14];
/** Taille de la figurine aux deux bouts du curseur (échelle d'ensemble). */
export const AVATAR_SIZE: readonly [number, number] = [0.9, 1.1];

export type FaceParams = {
  eyeStyle: number;
  browStyle: number;
  mouthStyle: number;
  noseStyle: number;
  eyeSpacing: number;
  eyeHeight: number;
  cheeks: number;
  freckles: number;
};

const lerp = ([a, b]: readonly [number, number], t: number) => a + (b - a) * t;

export function faceParams(look: AvatarLook): FaceParams {
  return {
    eyeStyle: EYE_STYLES.indexOf(look.eyes.style),
    browStyle: BROW_STYLES.indexOf(look.brows),
    mouthStyle: MOUTH_STYLES.indexOf(look.mouth),
    noseStyle: NOSE_STYLES.indexOf(look.nose),
    eyeSpacing: lerp(EYE_SPACING, look.eyes.spacing),
    eyeHeight: lerp(EYE_HEIGHT, look.eyes.height),
    cheeks: look.cheeks ? 1 : 0,
    freckles: look.freckles ? 1 : 0,
  };
}

export function avatarScale(look: AvatarLook): number {
  return lerp(AVATAR_SIZE, look.size);
}
