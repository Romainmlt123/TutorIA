import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { PressableBase } from '@/components/PressableBase';
import { BAND_VISIBLE_BOTTOM } from '@/components/ScreenBand';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { extras, theme } from '@/theme';

/**
 * Même espace au-dessus de « Salut Léa ! » (sous la barre d'état) et en dessous (jusqu'à la série
 * et au niveau, posés sur le bas du bandeau) : retour de Romain du 15/10.
 */
export const HOME_BAND_GAP = 48;

type Props = {
  firstName: string;
  unreadNotifications: number;
  onNotifications: () => void;
  onProfile: () => void;
};

/**
 * En-tête de l'Accueil dans le bandeau bleu : « Salut Léa ! » en grand (42 px), sur la même ligne
 * que les notifications (point violet = nouveauté) et l'avatar ; pas de citation (décision de Romain
 * du 15/10, écart n° 30 de design/README.md).
 */
export function HomeHeader({ firstName, unreadNotifications, onNotifications, onProfile }: Props) {
  return (
    <View style={styles.header}>
      <Text
        variant="h1"
        weight="black"
        color="textOnColor"
        accessibilityRole="header"
        numberOfLines={1}
        adjustsFontSizeToFit
        style={styles.greeting}>
        {fr.home.greeting(firstName)}
      </Text>
      <IconButton
        icon="cloche"
        accessibilityLabel={fr.home.notifications(unreadNotifications)}
        badge={unreadNotifications > 0}
        onBand
        onPress={onNotifications}
      />
      <PressableBase
        accessibilityRole="link"
        accessibilityLabel={fr.home.profile}
        onPress={onProfile}
        style={styles.avatar}>
        <Text variant="bodyLg" weight="bold" color="primary">
          {firstName.charAt(0)}
        </Text>
      </PressableBase>
    </View>
  );
}

const styles = StyleSheet.create({
  // Le bas du bandeau resté visible complète l'espace sous le titre jusqu'à HOME_BAND_GAP.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    marginBottom: HOME_BAND_GAP - BAND_VISIBLE_BOTTOM,
  },
  greeting: { flex: 1, ...extras.homeGreeting },
  avatar: {
    width: theme.space[12],
    height: theme.space[12],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
