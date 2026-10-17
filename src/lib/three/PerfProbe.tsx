import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { WebGLRenderer } from 'three';

import { addFrame, countContext, createFrameWindow, frameStats, publishPerf } from './perfStats';

/** Deux relevés par seconde : le compteur ne se redessine pas à chaque image. */
const PUBLISH_EVERY_S = 0.5;
/**
 * Priorité négative : la sonde passe avant tous les autres `useFrame` (Hd2dPost a 1) sans prendre
 * la main sur le rendu, que R3F ne laisse qu'aux priorités positives.
 */
const FIRST = -1000;

/** Ajouts d'expo-gl au contexte WebGL (natif seulement). */
type ExpoContext = WebGLRenderingContext & { contextId?: number; flushEXP?: () => void };

/**
 * En natif, expo-gl dessine sur son propre fil, sans jamais freiner le fil JS : le rythme des
 * images mesuré ici ne voit pas le coût du dessin. `flushEXP` attend que ce fil ait fini les
 * images déjà envoyées : environ 0 ms s'il suit, davantage s'il prend du retard. Cette attente
 * n'existe pas sans la sonde : l'image qu'elle allonge est écartée de la fenêtre. Null sur le
 * web, où le navigateur cale déjà le rythme des images sur le dessin.
 */
function measureGlLag(context: ExpoContext): number | null {
  if (!context.flushEXP) return null;
  const start = performance.now();
  context.flushEXP();
  return performance.now() - start;
}

/**
 * Chaque `gl.render` remet d'habitude les compteurs du rendu à zéro : avec les passes de Hd2dPost,
 * seule la dernière serait comptée. La sonde les remet à zéro elle-même, une fois par image. Rend
 * la fonction qui rétablit le réglage d'origine.
 */
function countWholeFrames(renderer: WebGLRenderer): () => void {
  const info = renderer.info;
  const autoReset = info.autoReset;
  info.autoReset = false;
  info.reset();
  return () => {
    info.autoReset = autoReset;
  };
}

/**
 * Sonde de performance (développement seulement), à placer dans un Canvas : rythme et temps
 * d'image sur 2 s, appels de dessin et triangles de toute l'image, textures et géométries en
 * mémoire, et contexte 3D. Elle publie un relevé deux fois par seconde (`PerfHud` l'affiche) et ne
 * change rien à ce qui est dessiné.
 */
export function PerfProbe() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const frames = useRef(createFrameWindow());
  const sincePublish = useRef(0);
  const skipNextFrame = useRef(false);
  const context = useRef<{ id: number | null; count: number }>({ id: null, count: 0 });

  useEffect(() => {
    const restore = countWholeFrames(gl);
    const expo = gl.getContext() as ExpoContext;
    context.current = { id: expo.contextId ?? null, count: countContext(expo) };
    return () => {
      restore();
      publishPerf(null);
    };
  }, [gl]);

  useFrame((_state, delta) => {
    // En tête d'image, `gl.info` contient toute l'image précédente (scène, passes d'effets ou rendu
    // de R3F) : on la lit, puis on remet les compteurs à zéro.
    if (skipNextFrame.current) skipNextFrame.current = false;
    else addFrame(frames.current, delta * 1000);
    sincePublish.current += delta;
    if (sincePublish.current >= PUBLISH_EVERY_S) {
      sincePublish.current = 0;
      const { render, memory } = gl.info;
      const glLag = measureGlLag(gl.getContext() as ExpoContext);
      // L'attente de `flushEXP` tombe dans la durée de l'image suivante.
      skipNextFrame.current = glLag !== null;
      publishPerf({
        ...frameStats(frames.current),
        glLag,
        calls: render.calls,
        triangles: render.triangles,
        textures: memory.textures,
        geometries: memory.geometries,
        contextId: context.current.id,
        contexts: context.current.count,
        // Hd2dPost dessine la scène à 2 pixels par dp au plus, et le note dans la scène.
        renderRatio: (scene.userData.renderRatio as number | undefined) ?? gl.getPixelRatio(),
      });
    }
    gl.info.reset();
  }, FIRST);

  return null;
}
