import { logError } from '@/lib/logger';

/**
 * Le navigateur peut refuser WebGL (accélération graphique désactivée, pilote sur liste noire,
 * trop de contextes ouverts) : on essaie d'en créer un, puis on le libère aussitôt.
 */
let cached: boolean | null = null;

export function canUseWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  if (cached !== null) return cached;
  cached = probe();
  return cached;
}

function probe(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch (error) {
    logError('three.webgl', error);
    return false;
  }
}
