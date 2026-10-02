/**
 * En natif, le rendu 3D passe par expo-gl, toujours présent dans l'app et dans Expo Go.
 * La variante web (webgl.web.ts) vérifie que le navigateur accepte de créer un contexte WebGL.
 */
export function canUseWebGL(): boolean {
  return true;
}
