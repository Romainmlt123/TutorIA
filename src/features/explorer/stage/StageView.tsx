import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SceneBoundary } from '@/lib/three/SceneBoundary';

import { IslandStage } from '../components/IslandStage';
import { SkyBackdrop } from '../components/SkyBackdrop';
import { StageFallback } from '../components/StageFallback';
import { followVisit, type StageAttempt, type StageScene } from './stageStore';

/**
 * La scène 3D d'Explorer, en plein écran : dessinée par l'hôte de la racine sur Android, dans
 * l'écran Explorer sur iOS et le web (`ROOT_STAGE`).
 *
 * - Le ciel est là avant la première image de la scène : aucun éclair de fond clair.
 * - Elle ne reçoit aucun toucher (les gestes sont sur le HUD de l'écran) et reste cachée aux
 *   lecteurs d'écran.
 * - Hors de l'onglet Explorer (`shown`), elle est transparente (opacité nulle, et non
 *   `display: 'none'`) : sa vue reste dans la fenêtre, avec son contexte 3D, mais rien d'elle ne se
 *   voit sous les autres onglets, ni pendant les transitions de leurs écrans.
 * - Si elle échoue, l'image fixe prend sa place, puis elle est retentée à la visite suivante
 *   d'Explorer (`followVisit`).
 */
export function StageView({ stage, fallback, shown }: StageScene) {
  const [attempt, setAttempt] = useState<StageAttempt>({
    key: 0,
    failed: false,
    active: stage.active,
  });
  // Une visite d'Explorer commence ou finit : une scène en échec sera retentée (pendant le rendu,
  // comme le veut React pour un état qui suit une valeur, et non dans un effet).
  const visit = followVisit(attempt, stage.active);
  if (visit !== attempt) setAttempt(visit);

  return (
    <View
      pointerEvents="none"
      aria-hidden
      style={[StyleSheet.absoluteFill, !shown && styles.hidden]}>
      <SkyBackdrop />
      <SceneBoundary
        key={visit.key}
        scope="explorer.scene"
        onError={() => setAttempt((current) => ({ ...current, failed: true }))}
        fallback={<StageFallback {...fallback} />}>
        <IslandStage {...stage} />
      </SceneBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: { opacity: 0 },
});
