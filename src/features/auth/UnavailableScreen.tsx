import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { logError } from '@/lib/logger';
import { authService } from '@/services/auth';
import { theme } from '@/theme';

/** Session présente mais compte illisible (hors ligne au premier lancement). */
export function UnavailableScreen() {
  const retry = () => {
    authService.refreshAccount().catch((error: unknown) => logError('auth.retry', error));
  };
  const signOut = () => {
    authService.signOut().catch((error: unknown) => logError('auth.signOut', error));
  };
  return (
    <ScreenContainer scroll={false} withNav={false} contentStyle={styles.content}>
      <View style={styles.center}>
        <Logo variant="onBlue" size={72} borderRadius={20} />
        <Text variant="h3" weight="black" align="center">
          {fr.unavailable.title}
        </Text>
        <Text variant="body" color="textSecondary" align="center">
          {fr.unavailable.body}
        </Text>
      </View>
      <Button label={fr.unavailable.retry} onPress={retry} size="lg" highlight />
      <Button label={fr.unavailable.signOut} onPress={signOut} variant="soft" size="lg" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[3] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.space[4] },
});
