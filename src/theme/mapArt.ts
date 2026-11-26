import { explorerArt } from './explorerArt';

const HUD = explorerArt.hud;

/**
 * Couleurs de la carte pré-rendue d'une région (X2b) que React Native dessine par-dessus le rendu de
 * Blender. Elles reprennent la palette du monde (`explorerArt`, que la session principale tient) sans
 * la modifier : une couleur nouvelle de la carte va ici.
 */
export const mapArt = {
  /** Reflets du soleil sur l'eau du π : la lueur de l'eau en 3D. */
  glint: explorerArt.water3d.glow,
  /** Nuages sous l'île : dessus éclairé, dessous bleuté, comme les nuages en 3D. */
  cloud: { lit: explorerArt.cloud.top, shade: explorerArt.cloud.bottom },
  /**
   * Célébration au retour d'un niveau, dans la palette du HUD de jeu : étincelles des étoiles
   * gagnées, confettis d'une ville validée, anneau chaud d'une ville à consolider.
   */
  celebration: {
    sparkle: [HUD.white, HUD.gold.face[0]],
    confetti: [
      HUD.gold.face[1],
      HUD.buttons.green.face[1],
      HUD.buttons.blue.face[1],
      HUD.streak.face[0],
      HUD.white,
    ],
    cue: HUD.status.consolidate.face,
    /** Épaisseur de l'anneau d'encouragement (dp) et sa lueur douce. */
    cueWidth: 3,
    cueGlow: `0px 0px 10px 2px ${HUD.status.consolidate.face}`,
  },
} as const;
