import type { ImageSourcePropType } from 'react-native';

/*
 * Cartes de région pré-rendues (X2b) : ce que décrivent les modules générés par
 * tools/explorer-3d/tile_map.py et sprite_pack.py (`*.generated.ts`, ne pas les modifier à la main).
 * Plan image : x de la carte vers la droite, v = z·sin52 − y·cos52 vers le bas, en mètres ; le pixel
 * (0, 0) de l'image rendue est au point (x0, v0).
 */

/** Asset Metro d'une image (`require(...)`) : un nombre en natif, une URL sur le web. */
export type ImageAsset = ImageSourcePropType;

/** Rectangle d'une image dans le rendu, en pixels (origine en haut à gauche). */
export type PixelRect = { x: number; y: number; width: number; height: number };

export type MapTile = PixelRect & { col: number; row: number; source: ImageAsset };

/** Planches miel d'un tronçon du chemin (entre le niveau `gap` et le suivant), posées sur les grises. */
export type DoneSegment = PixelRect & { gap: number; source: ImageAsset };

export type MapTiles = {
  version: number;
  regionId: string;
  /** Pixels du rendu par mètre du plan image. */
  ppm: number;
  /** Élévation de la caméra orthographique, en degrés. */
  elevation: number;
  x0: number;
  v0: number;
  width: number;
  height: number;
  /** Côté d'une tuile et recouvrement de chaque côté (pixels). */
  tile: number;
  bleed: number;
  /** Empreinte de la disposition rendue (mapExport) : des tuiles d'une autre disposition sont refusées. */
  layoutHash: string;
  /** Toute l'image en basse résolution (`factor` fois plus petite), posée sous les tuiles. */
  underlay: { factor: number; source: ImageAsset };
  tiles: readonly MapTile[];
  doneSegments: readonly DoneSegment[];
};

/** Sprite posé au sol : son point d'ancrage (pixels) est le pied du point de niveau. */
export type GroundSprite = {
  width: number;
  height: number;
  anchor: readonly [number, number];
  /** Rayon du point de niveau pour lequel le sprite est rendu (mètres). */
  radius: number;
  source: ImageAsset;
};

export type NodeSprites = {
  /** Pixels par mètre du plan image des sprites (rendus en 3x). */
  ppm: number;
  lecon: GroundSprite;
  exercices: GroundSprite;
  evaluation: GroundSprite;
  verrou: GroundSprite;
  'verrou-grand': GroundSprite;
  /** Halo des niveaux ouverts : anneau net et lueur douce (posée en mode « écran »). */
  anneau: GroundSprite;
  'anneau-grand': GroundSprite;
  lueur: GroundSprite;
  'lueur-grand': GroundSprite;
};
