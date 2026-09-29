import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { ComingSoon } from './ComingSoon';

/** Parcours : pas encore de maquette, écran provisoire. */
export function ParcoursScreen() {
  const router = useRouter();
  return (
    <ScreenContainer contentStyle={styles.content}>
      <Text variant="h2" weight="black" accessibilityRole="header">
        {fr.parcours.title}
      </Text>
      <ComingSoon
        icon="parcours"
        body={fr.parcours.body}
        actionLabel={fr.parcours.cta}
        onAction={() => router.navigate('/revisions')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[6] },
});
