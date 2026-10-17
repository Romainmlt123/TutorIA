import { SHADOW_FALL } from '../stylized3d/sun';
import { imageV } from './mapProjection';
import { MAP_ELEVATION } from './shots';

/*
 * L'avatar sur une carte pré-rendue (X2b) : une petite vue 3D transparente posée dans le contenu
 * qui défile, autour de ses pieds, et son ombre de contact dessinée par React Native dessous. Les
 * tailles sont arrondies au pixel de l'écran, et la caméra orthographique de la vue en est déduite :
 * la figurine a exactement la projection des tuiles, et ses pieds tombent sur le point du chemin.
 */

/**
 * Ce que montre la vue autour du point du sol sous la figurine, en mètres du plan image : la largeur,
 * et la hauteur au-dessus (tête, chapeau, bras levés du salut, saut) et en dessous (pieds en avant).
 */
export const AVATAR_VIEW = { width: 1.2, above: 1.25, below: 0.35 } as const;

export type AvatarFrame = {
  /** Taille de la vue (dp). */
  width: number;
  height: number;
  /** Place du coin haut gauche de la vue par rapport au point du sol sous la figurine (dp). */
  left: number;
  top: number;
  /** Cadre de la caméra orthographique autour de ce point (mètres du plan image, y vers le haut). */
  frustum: { left: number; right: number; top: number; bottom: number };
};

/** La vue de l'avatar à l'échelle de la carte (`k` dp par mètre, `ratio` pixels par dp). */
export function avatarFrame(k: number, ratio: number): AvatarFrame {
  const px = k * ratio;
  // En pixels entiers, la moitié de la largeur de chaque côté : les pieds sur un coin de pixel.
  const half = Math.ceil((AVATAR_VIEW.width / 2) * px);
  const above = Math.ceil(AVATAR_VIEW.above * px);
  const below = Math.ceil(AVATAR_VIEW.below * px);
  return {
    width: (2 * half) / ratio,
    height: (above + below) / ratio,
    left: -half / ratio,
    top: -above / ratio,
    frustum: { left: -half / px, right: half / px, top: above / px, bottom: -below / px },
  };
}

/**
 * Tache d'ombre de la carte 3D sous l'avatar (MapAvatar, groundShadows) : rayon 0,28 m pour un
 * objet de 0,6 m, posée à 0,04 m, opacité 0,42 au centre. Le carré de la tache fait 2,6 rayons de
 * côté, et 1,15 fois plus en largeur.
 */
const SHADOW = { radius: 0.28, height: 0.6, lift: 0.04, opacity: 0.42 } as const;
/** Demi-largeur de la tache (mètres). */
const SHADOW_HALF = SHADOW.radius * 1.3 * 1.15;

export type AvatarShadow = {
  /** Disque plein du centre, par rapport au point du sol sous la figurine (dp). */
  left: number;
  top: number;
  size: number;
  /** Écrasement vertical du disque : la tache est posée sur le sol vu à 52°. */
  scaleY: number;
  /** Ombre portée floue du disque (dp) : élargie de `spread`, adoucie sur `blur`. */
  spread: number;
  blur: number;
  opacity: number;
};

/**
 * La tache d'ombre de l'avatar en vues React Native, à `k` dp par mètre : un disque plein et son
 * ombre portée floue, qui reproduisent à peu près le dégradé de la carte 3D (plein jusqu'au quart
 * du rayon, moitié aux cinq huitièmes, rien au bord).
 */
export function avatarShadow(k: number): AvatarShadow {
  const centerX = SHADOW_FALL.x * SHADOW.height * k;
  const centerY = imageV(SHADOW_FALL.z * SHADOW.height, SHADOW.lift) * k;
  const core = 0.25 * SHADOW_HALF * k;
  return {
    left: centerX - core,
    top: centerY - core,
    size: 2 * core,
    scaleY: Math.sin((MAP_ELEVATION * Math.PI) / 180) / 1.15,
    spread: 0.375 * SHADOW_HALF * k,
    blur: 0.32 * SHADOW_HALF * k,
    opacity: SHADOW.opacity,
  };
}
