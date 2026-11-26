import { advance, useStore } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';

import { createPacer, keepsRunning, pace, requestFrames, rest, viewChanged } from './framePacer';
import { advanceClock, SCENE_TIME } from './sceneClock';

/** Réveils des pilotes montés, appelés par `requestSceneFrames`. */
const wakers = new Set<() => void>();

/**
 * Demande quelques images aux scènes pilotées, depuis l'extérieur du Canvas : un geste qui commence
 * (rotation de l'île, défilement de la carte) ou un déplacement demandé par l'interface. Sans effet
 * tant que les animations sont jouées : les images ne s'arrêtent alors jamais.
 */
export function requestSceneFrames(): void {
  wakers.forEach((wake) => wake());
}

const noop = () => undefined;

type Props = {
  /** Faux quand l'onglet est caché ou l'app en arrière-plan : plus aucune image, plus aucun battement. */
  active: boolean;
  /** Faux avec « Réduire les animations » : des images seulement quand quelque chose change. */
  animated: boolean;
  /** Images par seconde au plus (60 par défaut) : une scène presque immobile peut en demander moins. */
  fps?: number;
};

/**
 * Pilote des images d'un Canvas, à placer dedans, le Canvas étant en `frameloop="never"` : R3F n'a
 * pas de plafond (120 images par seconde sur un écran à 120 Hz), et il remet son horloge à zéro à
 * chaque changement de `frameloop`.
 *
 * - Il fait tourner sa propre boucle (`requestAnimationFrame`), plafonnée à 60 images par seconde
 *   (ou à `fps`), avance l'horloge de la scène (`SCENE_TIME`) puis calcule l'image (`advance` de R3F).
 * - Scène inactive : la boucle s'arrête tout à fait.
 * - Animations réduites : la scène ne se dessine que si quelque chose change, puis s'arrête après
 *   quelques images. Ce qui la réveille : un nouveau rendu React de la scène (props changées), un
 *   changement que R3F signale lui-même (`invalidate` : modèle chargé, objet ajouté), un changement
 *   de son état (taille, densité), la caméra qui bouge encore, `invalidate()` appelé dans un
 *   `useFrame`, et `requestSceneFrames()` hors du Canvas.
 *
 * Toute scène qui montre les décors animés d'Explorer (eau, herbe, nuages) le prend : il est le
 * seul à faire avancer leur horloge. Une erreur pendant une image fait échouer la scène : son
 * filet (`SceneBoundary`) la journalise et affiche le repli, au lieu d'une erreur à chaque image.
 */
export function FrameDriver({ active, animated, fps = 60 }: Props) {
  const store = useStore();
  const wake = useRef<() => void>(noop);
  // Lu à chaque battement : changer de rythme ne relance pas la boucle.
  const interval = useRef(1000 / fps);
  useEffect(() => {
    interval.current = 1000 / fps;
  }, [fps]);
  const [failure, setFailure] = useState<Error | null>(null);
  if (failure) throw failure;

  useEffect(() => {
    if (!active) return;
    const pacer = createPacer();
    const view: number[] = [];
    let frame: number | null = null;
    const draw = (delta: number) => {
      advanceClock(SCENE_TIME, delta, animated);
      const state = store.getState();
      // En `frameloop="never"`, R3F prend pour durée de l'image l'écart avec sa dernière heure.
      advance(state.clock.elapsedTime + delta, true, state);
      const { camera } = state;
      if (viewChanged(view, [camera.matrixWorld.elements, camera.projectionMatrix.elements])) {
        requestFrames(pacer);
      }
    };
    const loop = (now: number) => {
      let failed = false;
      try {
        const delta = pace(pacer, now, interval.current);
        if (delta !== null) draw(delta);
      } catch (error) {
        failed = true;
        setFailure(error instanceof Error ? error : new Error(String(error)));
      }
      // Pendant `draw`, `frame` garde l'identifiant de ce battement : un réveil ne lance pas de
      // seconde boucle, il ajoute seulement des images.
      frame = !failed && keepsRunning(pacer, animated) ? requestAnimationFrame(loop) : null;
      if (frame === null) rest(pacer);
    };
    const start = () => {
      requestFrames(pacer);
      frame ??= requestAnimationFrame(loop);
    };
    // R3F demande une image à chaque changement de la scène qu'il voit (modèle chargé, objet
    // ajouté, prop modifiée) ; en `frameloop="never"`, sa demande se perdait : elle réveille le pilote.
    const { invalidate } = store.getState();
    store.setState({ invalidate: start });
    // Chaque changement de son état aussi (taille, densité : fenêtre redimensionnée, zoom du
    // navigateur, qui efface la toile sur le web) : R3F ne le signale qu'à sa propre boucle.
    const unsubscribe = store.subscribe(start);
    wake.current = start;
    wakers.add(start);
    start();
    return () => {
      unsubscribe();
      wakers.delete(start);
      wake.current = noop;
      store.setState({ invalidate });
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [active, animated, store]);

  // Chaque rendu React de la scène (vue, île, région ou cadrage changés) demande quelques images.
  useEffect(() => {
    wake.current();
  });

  return null;
}
