import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormMessage } from '@/components/form/FormMessage';
import { ScreenContainer } from '@/components/ScreenContainer';
import { fr } from '@/i18n/fr';
import { authService } from '@/services/auth';
import { theme } from '@/theme';

import { AuthHero } from './components/AuthHero';
import { authErrorMessage } from './logic/errors';

const t = fr.parent.invitation;

/**
 * Arrivée depuis l'e-mail d'invitation d'un parent (/invitation?token_hash=…, sans maquette).
 * Le lien n'est vérifié qu'au clic : les robots qui ouvrent les liens des e-mails ne le consomment pas.
 */
export function InvitationScreen() {
  const router = useRouter();
  const { token_hash: tokenHash } = useLocalSearchParams<{ token_hash?: string }>();
  const [message, setMessage] = useState<string | null>(tokenHash ? null : t.invalid);
  const [busy, setBusy] = useState(false);

  const accept = async () => {
    if (!tokenHash) return;
    setBusy(true);
    setMessage(null);
    try {
      await authService.acceptInvite(tokenHash);
    } catch (error) {
      setBusy(false);
      setMessage(authErrorMessage(error, 'parent'));
    }
  };

  return (
    <ScreenContainer withNav={false} contentStyle={styles.content}>
      <AuthHero tone="parent" kicker={fr.parent.signIn.kicker} title={t.title} subtitle={t.body} />
      <FormMessage message={message} />
      <View style={styles.actions}>
        <Button
          label={t.accept}
          onPress={accept}
          disabled={busy || !tokenHash}
          tone="parent"
          size="lg"
          icon="fleche-droite"
          highlight
        />
        <Button
          label={fr.parent.signIn.submit}
          onPress={() => router.replace('/connexion/parent')}
          variant="soft"
          size="lg"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[6] },
  actions: { gap: theme.space[3] },
});
