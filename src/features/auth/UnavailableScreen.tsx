import { useEffect } from 'react';
import { AppState, StyleSheet, View } from 'react-native';

import { BrandMessage } from '@/components/BrandMessage';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { logError } from '@/lib/logger';
import { authService } from '@/services/auth';
import { extras, theme } from '@/theme';

const t = fr.unavailable;
/** Sans réseau, le compte est relu de lui-même : toutes les 15 s, et au retour de l'app. */
const AUTO_RETRY_MS = 15_000;

const retry = () => {
  authService.refreshAccount().catch((error: unknown) => logError('auth.retry', error));
};

/**
 * H2 · Pas de connexion au premier lancement (v2.19) : session présente mais compte illisible.
 * La mise en page de la pause (fond de marque, tuteur avec un Wi-Fi barré), « Réessayer », et un
 * réessai automatique tant que l'écran est affiché ; textes neutres (élève ou parent).
 */
export function UnavailableScreen() {
  useEffect(() => {
    const timer = setInterval(retry, AUTO_RETRY_MS);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') retry();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);

  const signOut = () => {
    authService.signOut().catch((error: unknown) => logError('auth.signOut', error));
  };

  return (
    <BrandMessage
      badge={{ icon: 'wifi-barre', color: theme.palette.orange[700] }}
      title={t.title}
      body={t.body}
      withNav={false}
      standalone>
      <View style={styles.retry}>
        <Button
          label={t.retry}
          variant="white"
          size="lg"
          leadingIcon="actualiser"
          labelColor={theme.colors.primaryHover}
          shadow={extras.studyPause.buttonShadow}
          onPress={retry}
          style={styles.button}
        />
        <View style={styles.hint}>
          <Icon name="info" size={18} color={theme.colors.textOnColor} />
          <Text variant="hint" color="textOnColor" style={styles.hintText}>
            {t.hint}
          </Text>
        </View>
      </View>
      <PressableBase
        onPress={signOut}
        accessibilityRole="link"
        accessibilityLabel={t.signOut}
        style={styles.link}>
        <Text variant="body" weight="bold" color="textOnColor" style={styles.underline}>
          {t.signOut}
        </Text>
      </PressableBase>
    </BrandMessage>
  );
}

const styles = StyleSheet.create({
  retry: { gap: theme.space[3], marginTop: theme.space[2] },
  button: { height: 56, borderRadius: 18 },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[2],
  },
  hintText: { opacity: 0.85 },
  link: { alignSelf: 'center', minHeight: 48, justifyContent: 'center' },
  underline: { textDecorationLine: 'underline' },
});
