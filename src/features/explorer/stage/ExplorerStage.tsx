import { useLayoutEffect } from 'react';

import { ROOT_STAGE } from './rootStage';
import { EXPLORER_STAGE, leaveStage, publishStage, type StageScene } from './stageStore';
import { StageView } from './StageView';

/**
 * La scène 3D vue de l'écran Explorer. Sur Android, elle ne dessine rien ici : elle confie ses props
 * à l'hôte monté à la racine (`ExplorerStageHost`), qui la dessine sous la pile de navigation, à
 * travers le fond transparent de l'onglet. Sur iOS et le web, elle est dessinée dans l'écran.
 */
export function ExplorerStage(scene: StageScene) {
  return ROOT_STAGE ? <PublishedStage {...scene} /> : <StageView {...scene} />;
}

/** Confie la scène à l'hôte de la racine. Démontée, elle s'arrête et se cache, sans être oubliée. */
function PublishedStage(scene: StageScene) {
  // À chaque rendu de l'écran, et avant l'affichage : l'hôte se met à jour dans la même image que
  // l'écran (un onglet qui change, par exemple, cache ou montre la scène sans décalage).
  useLayoutEffect(() => {
    publishStage(EXPLORER_STAGE, scene);
  });
  useLayoutEffect(() => () => leaveStage(EXPLORER_STAGE), []);
  return null;
}
