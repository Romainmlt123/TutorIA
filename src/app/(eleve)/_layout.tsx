import { Tabs } from 'expo-router/js-tabs';

import { BottomNav } from '@/components/navigation/BottomNav';
import { theme } from '@/theme';

/** Navigation de l'espace élève : 5 onglets et la barre flottante de la maquette. */
export default function StudentLayout() {
  return (
    <Tabs
      backBehavior="history"
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: theme.colors.bg } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="parcours" />
      <Tabs.Screen name="tuteur" />
      <Tabs.Screen name="revisions" />
      <Tabs.Screen name="stats" />
      {/* Hors de la barre : le profil n'est pas un onglet (BottomNav s'y masque). */}
      <Tabs.Screen name="profil" />
    </Tabs>
  );
}
