/**
 * Convertit un angle CSS de `linear-gradient` (0° = vers le haut, 90° = vers la droite,
 * 180° = vers le bas) en points de départ et d'arrivée pour expo-linear-gradient (repère 0–1).
 */
export function angleToPoints(angleDeg: number): {
  start: { x: number; y: number };
  end: { x: number; y: number };
} {
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(rad) / 2;
  const dy = -Math.cos(rad) / 2;
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return {
    start: { x: round(0.5 - dx), y: round(0.5 - dy) },
    end: { x: round(0.5 + dx), y: round(0.5 + dy) },
  };
}
