/** Contexte WebGL : expo-gl (natif) y ajoute `endFrameEXP`, qui présente l'image. */
type FrameContext = object & { endFrameEXP?: () => void };

/**
 * Dessine une image en plusieurs passes (textures intermédiaires, puis l'écran) avec une seule
 * présentation. En natif, R3F termine l'image après chaque `gl.render` (endFrameEXP d'expo-gl) : une
 * passe intermédiaire présenterait un écran pas encore dessiné. Pendant `draw`, cette fin d'image
 * est neutralisée ; `present()`, appelée juste avant le rendu de la dernière passe, la rétablit.
 * Elle est rétablie quoi qu'il arrive : une passe qui échoue ne doit pas empêcher les images
 * suivantes. Sans effet sur le web, où le navigateur présente l'image seul.
 */
export function presentOnce(context: FrameContext, draw: (present: () => void) => void): void {
  const endFrame = context.endFrameEXP;
  if (endFrame) context.endFrameEXP = () => undefined;
  const present = () => {
    if (endFrame) context.endFrameEXP = endFrame;
  };
  try {
    draw(present);
  } finally {
    present();
  }
}
