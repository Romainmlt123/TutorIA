import { logError } from '@/lib/logger';

/*
 * Sonde des capacités du contexte 3D, pour l'atelier (développement seulement) : ce que le
 * téléphone permet vraiment (taille des textures, anticrénelage, extensions), lu une fois.
 */

/** Noms WebGL en valeur : un contexte expo-gl ou factice n'expose pas forcément les constantes. */
export const GL = {
  MAX_TEXTURE_SIZE: 0x0d33,
  MAX_RENDERBUFFER_SIZE: 0x84e8,
  MAX_SAMPLES: 0x8d57,
  VENDOR: 0x1f00,
  RENDERER: 0x1f01,
  VERSION: 0x1f02,
  // Extension WEBGL_debug_renderer_info (navigateur) : le vrai nom de la puce graphique.
  UNMASKED_VENDOR: 0x9245,
  UNMASKED_RENDERER: 0x9246,
} as const;

/** Ce que la sonde demande au contexte (WebGL, ou expo-gl en natif). */
export type GlProbeContext = {
  getParameter: (name: number) => unknown;
  getExtension: (name: string) => unknown;
  getSupportedExtensions: () => string[] | null;
};

export type GlCapabilities = {
  /** `typeof WebAssembly` : « object » si le moteur JS le connaît (Meshopt, Draco). */
  webAssembly: string;
  maxTextureSize: number | null;
  maxRenderbufferSize: number | null;
  /** Échantillons d'anticrénelage permis pour une texture de rendu (WebGL 2). */
  maxSamples: number | null;
  renderer: string | null;
  vendor: string | null;
  version: string | null;
  extensions: string[];
};

/**
 * Une lecture refusée (expo-gl lève une erreur pour un nom qu'il ne connaît pas, un pilote exotique
 * aussi) reste vide, sans faire tomber la scène de l'atelier, qui lit la sonde à sa création.
 */
function attempt<T>(read: () => T, fallback: T): T {
  try {
    return read();
  } catch (error) {
    logError('explorer.atelier.glProbe', error);
    return fallback;
  }
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function asText(value: unknown): string | null {
  return typeof value === 'string' && value !== '' ? value : null;
}

export function readGlCapabilities(context: GlProbeContext): GlCapabilities {
  const read = (name: number) => attempt(() => context.getParameter(name), null);
  const unmasked = attempt(() => Boolean(context.getExtension('WEBGL_debug_renderer_info')), false);
  return {
    webAssembly: typeof WebAssembly,
    maxTextureSize: asNumber(read(GL.MAX_TEXTURE_SIZE)),
    maxRenderbufferSize: asNumber(read(GL.MAX_RENDERBUFFER_SIZE)),
    maxSamples: asNumber(read(GL.MAX_SAMPLES)),
    renderer: asText(read(unmasked ? GL.UNMASKED_RENDERER : GL.RENDERER)),
    vendor: asText(read(unmasked ? GL.UNMASKED_VENDOR : GL.VENDOR)),
    version: asText(read(GL.VERSION)),
    extensions: attempt(() => [...(context.getSupportedExtensions() ?? [])].sort(), []),
  };
}
