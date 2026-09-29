import { Stack } from 'expo-router';

import { StudyGate } from '@/features/access/StudyGate';
import { useStudyRules } from '@/lib/session/useStudyRules';
import { theme } from '@/theme';

// L'écrit reste sous le vocal : « Raccrocher » revient à la conversation en cours.
export const unstable_settings = { initialRouteName: 'index' };

/**
 * Tuteur : bloqué sous 15 ans sans validation d'un parent, en pause selon les réglages parentaux,
 * et sans vocal si le parent l'a désactivé (le serveur refuse aussi le jeton).
 */
export default function TutorLayout() {
  const { data: rules } = useStudyRules();
  return (
    <StudyGate requireConsent>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: theme.colors.bg },
        }}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={rules?.voiceEnabled ?? true}>
          <Stack.Screen name="vocal" />
        </Stack.Protected>
      </Stack>
    </StudyGate>
  );
}
