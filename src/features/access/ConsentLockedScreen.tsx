import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { AccessCard } from './components/AccessCard';

/**
 * Tuteur bloqué pour un élève de moins de 15 ans tant qu'un parent n'a pas validé le compte :
 * le tuteur transmet des contenus à OpenAI, ce qui demande le consentement parental (CNIL).
 */
export function ConsentLockedScreen() {
  const router = useRouter();
  return (
    <ScreenContainer contentStyle={styles.content}>
      <Text variant="h2" weight="black" accessibilityRole="header">
        {fr.consent.bannerTitle}
      </Text>
      <AccessCard
        icon="bouclier"
        body={fr.consent.tutorLocked}
        actionLabel={fr.consent.action}
        onAction={() => router.push('/relier-parent')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[6] },
});
