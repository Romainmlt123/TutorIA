import { Tabs } from 'expo-router/js-tabs';

import { BottomNav, PARENT_TABS } from '@/components/navigation/BottomNav';
import { SelectedChildProvider } from '@/features/parents/hooks/useSelectedChild';
import { fr } from '@/i18n/fr';
import { useSession } from '@/lib/session/SessionProvider';
import { theme } from '@/theme';

/**
 * Espace Parents : 4 onglets (Accueil, Progrès, Sessions, Réglages) et la barre flottante.
 * Juste après l'inscription (L4), le parent arrive sur l'ajout de son enfant (L5).
 */
export default function ParentLayout() {
  const session = useSession();
  const freshSignUp = session.status === 'signedIn' && session.freshSignUp;
  return (
    <SelectedChildProvider>
      <Tabs
        initialRouteName={freshSignUp ? 'parents/enfant' : 'parents/index'}
        backBehavior="history"
        tabBar={(props) => (
          <BottomNav {...props} tabs={PARENT_TABS} accessibilityLabel={fr.parent.nav.label} />
        )}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: theme.colors.bg } }}>
        <Tabs.Screen name="parents/index" />
        <Tabs.Screen name="parents/progres" />
        <Tabs.Screen name="parents/sessions" />
        <Tabs.Screen name="parents/reglages" />
        <Tabs.Screen name="parents/enfant" />
        <Tabs.Screen name="parents/donnees" />
      </Tabs>
    </SelectedChildProvider>
  );
}
