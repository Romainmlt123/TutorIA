/**
 * Densité maximale (pixels par dp) de la scène et des flous de Hd2dPost. En natif, R3F dessine à
 * la densité de l'écran (jusqu'à 3 sur Android) et ignore la prop `dpr` du Canvas : au-delà de 2,
 * l'œil ne voit plus la différence sur une scène anticrénelée, et chaque pixel coûte. La passe
 * finale agrandit l'image à la taille de l'écran. Sur le web, le tampon suit déjà `dpr={[1, 2]}`.
 */
export const MAX_RENDER_RATIO = 2;

export type PassSize = { width: number; height: number };

/**
 * Tailles des textures des passes, d'après le tampon de dessin (pixels) et sa densité : la scène
 * (et son flou de maquette) à 2 pixels par dp au plus, le halo à demi-résolution de la scène.
 */
export function passSizes(
  buffer: { x: number; y: number },
  pixelRatio: number,
): { scene: PassSize; half: PassSize } {
  const capped = pixelRatio > MAX_RENDER_RATIO;
  const scaled = (pixels: number) =>
    Math.max(1, Math.floor(capped ? (pixels * MAX_RENDER_RATIO) / pixelRatio : pixels));
  const scene = { width: scaled(buffer.x), height: scaled(buffer.y) };
  const half = {
    width: Math.max(1, Math.floor(scene.width / 2)),
    height: Math.max(1, Math.floor(scene.height / 2)),
  };
  return { scene, half };
}
