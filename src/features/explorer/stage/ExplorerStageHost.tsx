import { useEffect, useSyncExternalStore } from 'react';

import { StageView } from './StageView';
import { clearStage, EXPLORER_STAGE, subscribeStage } from './stageStore';

const subscribe = (listener: () => void) => subscribeStage(EXPLORER_STAGE, listener);
const read = () => EXPLORER_STAGE.scene;

/**
 * Hôte de la scène 3D d'Explorer, monté dans le layout racine, sous la pile de navigation, pour
 * l'espace élève et sur Android seulement (`ROOT_STAGE`). Hors de react-native-screens, sa vue 3D
 * ne quitte jamais la fenêtre : Android garde son contexte quand on change d'onglet ou qu'un niveau
 * s'ouvre par-dessus, et la scène n'est construite qu'une fois.
 *
 * - Il ne monte rien avant la première visite d'Explorer, puis garde la scène jusqu'au changement
 *   d'espace (déconnexion), en pause (aucune image) quand l'onglet est caché.
 * - Il ne se voit qu'à travers l'espace élève et l'onglet Explorer, transparents ; tous les autres
 *   écrans ont leur fond et le couvrent. Quand un autre onglet est choisi, la scène est en plus
 *   transparente (`shown`) : rien d'elle ne paraît pendant la transition d'un écran de la pile.
 */
export function ExplorerStageHost() {
  const scene = useSyncExternalStore(subscribe, read, read);
  // Démonté au changement d'espace : la scène est oubliée, son contexte 3D libéré.
  useEffect(() => () => clearStage(EXPLORER_STAGE), []);
  return scene ? <StageView {...scene} /> : null;
}
