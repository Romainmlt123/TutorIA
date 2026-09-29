import { Stack } from 'expo-router';

import { OnboardingProvider } from '@/features/onboarding/hooks/useOnboarding';
import { theme } from '@/theme';

export const unstable_settings = { initialRouteName: 'onboarding/classe' };

/** Onboarding (O1 à O5) : les réponses sont partagées par les cinq écrans. */
export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg } }}
      />
    </OnboardingProvider>
  );
}
