import type { Framing } from './editor';

/*
 * Cadrages de l'aperçu de l'éditeur (caméra de 30° de champ vertical). Repère de la scène : les
 * pieds de la figurine à l'origine, y vers le haut, la figurine regarde vers +z ; elle mesure 1 m à
 * l'échelle 1.
 */

export type Vec3 = readonly [number, number, number];
export type PreviewShot = { from: Vec3; aim: Vec3 };

/** Hauteur du centre de la tête, à l'échelle 1 (tools/avatar-3d/avatar.py). */
export const FACE_HEIGHT = 0.78;

/**
 * Le visage de près, qui suit la taille de la figurine pour rester au centre ; ou la figurine en
 * pied, cadrée pour la plus grande taille : on la voit grandir ou rapetisser.
 */
export function previewShot(framing: Framing, scale: number): PreviewShot {
  if (framing === 'face') {
    // Un peu sous le centre de la tête : on voit le visage, la coiffure et le haut des épaules.
    const aim = (FACE_HEIGHT - 0.03) * scale;
    return { from: [0, aim + 0.07, 1.6], aim: [0, aim, 0] };
  }
  return { from: [0, 0.78, 2.5], aim: [0, 0.54, 0] };
}

/** Rotation de la figurine au doigt (radians), lue à chaque image par l'aperçu. */
export type TurnState = { current: number; atStart: number };

/** Radians par pixel glissé. */
export const TURN_PER_PX = 0.012;

export function createTurn(): TurnState {
  return { current: 0, atStart: 0 };
}

export function beginTurn(turn: TurnState): void {
  turn.atStart = turn.current;
}

/** Le doigt a glissé de `dx` pixels depuis le début du geste. */
export function dragTurn(turn: TurnState, dx: number): void {
  turn.current = turn.atStart + dx * TURN_PER_PX;
}

/** La figurine se remet de face (pour régler le visage). */
export function faceFront(turn: TurnState): void {
  turn.current = 0;
  turn.atStart = 0;
}
