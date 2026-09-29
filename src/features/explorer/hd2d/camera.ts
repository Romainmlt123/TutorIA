/**
 * Cadrage : distance de caméra pour qu'un objet de largeur `width` occupe la fraction `fill` de
 * la largeur de l'écran, quel que soit son format (portrait sur téléphone, paysage sur le web).
 */
export function distanceToFit(
  width: number,
  fovYDegrees: number,
  aspect: number,
  fill: number,
): number {
  const halfFovX = Math.atan(Math.tan((fovYDegrees * Math.PI) / 360) * aspect);
  return width / 2 / fill / Math.tan(halfFovX);
}

/** Position de caméra à `distance` d'une cible, selon une élévation (degrés) et un azimut. */
export function orbit(
  target: readonly [number, number, number],
  distance: number,
  elevationDegrees: number,
  azimuth = 0,
): [number, number, number] {
  const el = (elevationDegrees * Math.PI) / 180;
  const flat = Math.cos(el) * distance;
  return [
    target[0] + Math.sin(azimuth) * flat,
    target[1] + Math.sin(el) * distance,
    target[2] + Math.cos(azimuth) * flat,
  ];
}
