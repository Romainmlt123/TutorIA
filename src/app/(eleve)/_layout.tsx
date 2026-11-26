import { Tabs } from 'expo-router/js-tabs';

import { BottomNav } from '@/components/navigation/BottomNav';
import { SEE_THROUGH } from '@/features/explorer/stage/rootStage';
import { theme } from '@/theme';

/** Navigation de l'espace élève : 5 onglets et la barre flottante de la maquette. */
export default function StudentLayout() {
  return (
    <Tabs
      backBehavior="history"
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: theme.colors.bg } }}>
      <Tabs.Screen name="index" />
      {/* Transparent : sur Android, la scène 3D, montée sous la pile (ExplorerStageHost), s'y voit. */}
      <Tabs.Screen name="explorer" options={{ sceneStyle: SEE_THROUGH }} />
      <Tabs.Screen name="tuteur" />
      <Tabs.Screen name="revisions" />
      <Tabs.Screen name="stats" />
      {/* Hors de la barre : le profil n'est pas un onglet (BottomNav s'y masque). */}
      <Tabs.Screen name="profil" />
    </Tabs>
  );
}
