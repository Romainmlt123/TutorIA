import { Stack } from 'expo-router';

import { theme } from '@/theme';

export const unstable_settings = { initialRouteName: 'bienvenue' };

/** Connexion et inscription : pas de barre de navigation. */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg } }}
    />
  );
}
