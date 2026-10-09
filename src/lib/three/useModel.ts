import { useEffect, useState } from 'react';
import { type GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { logError } from '@/lib/logger';

/*
 * Chargement des modèles 3D (glTF) sans suspendre la scène.
 *
 * Pourquoi pas `useLoader` de React Three Fiber : il suspend la scène pendant le chargement, et la
 * reprise après un Suspense est rendue par tranches. Sur Android, l'app (Fabric) et la scène 3D
 * (R3F) gardent les valeurs de contexte au même endroit (`_currentValue2`) : si l'app se redessine
 * entre deux tranches, elle lit le contexte de navigation laissé par la scène et React Navigation
 * s'arrête (« nested a NavigationContainer »). Ici, le modèle arrive par un simple changement
 * d'état, rendu d'un seul tenant.
 *
 * Les modèles chargés sont gardés en mémoire et partagés : chaque scène en fait sa propre copie.
 */

/** Asset Metro (`require(...)`) : un nombre en natif, une URL sur le web. */
export type ModelAsset = string;

const loader = new GLTFLoader();
const pending = new Map<ModelAsset, Promise<GLTF>>();
const ready = new Map<ModelAsset, GLTF>();

/** Charge un modèle (une seule fois par asset) ; un échec pourra être retenté plus tard. */
export function loadModel(asset: ModelAsset): Promise<GLTF> {
  const known = pending.get(asset);
  if (known) return known;
  const promise = new Promise<GLTF>((resolve, reject) => {
    loader.load(
      asset,
      (gltf) => {
        ready.set(asset, gltf);
        resolve(gltf);
      },
      undefined,
      reject,
    );
  });
  pending.set(asset, promise);
  promise.catch(() => pending.delete(asset));
  return promise;
}

/** Commence à charger un modèle avant d'en avoir besoin. */
export function preloadModel(asset: ModelAsset) {
  loadModel(asset).catch((error: unknown) => logError('three.model', error));
}

/** Le modèle s'il est chargé, sinon null (le composant n'affiche rien en attendant). */
export function useModel(asset: ModelAsset): GLTF | null {
  const [loaded, setLoaded] = useState<{ asset: ModelAsset; gltf: GLTF } | null>(null);
  useEffect(() => {
    if (ready.has(asset)) return;
    let alive = true;
    loadModel(asset).then(
      (gltf) => {
        if (alive) setLoaded({ asset, gltf });
      },
      (error: unknown) => logError('three.model', error),
    );
    return () => {
      alive = false;
    };
  }, [asset]);
  return ready.get(asset) ?? (loaded?.asset === asset ? loaded.gltf : null);
}
