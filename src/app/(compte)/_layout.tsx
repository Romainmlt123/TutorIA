import { Stack } from 'expo-router';

import { useSession } from '@/lib/session/SessionProvider';
import { theme } from '@/theme';

/** Compte à finaliser : nouveau mot de passe après un code de récupération, ou parent invité. */
export default function AccountLayout() {
  const session = useSession();
  const recovery = session.status === 'signedIn' && session.recovery;
  return (
    <Stack
      initialRouteName={recovery ? 'nouveau-mot-de-passe' : 'validation-parent'}
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg } }}
    />
  );
}
