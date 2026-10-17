import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { Watermark } from '@/components/Watermark';
import { fr } from '@/i18n/fr';
import { extras, liftShadow, theme } from '@/theme';

/**
 * Carte Série : orange uni (jamais de dégradé), texte blanc, flamme en filigrane. À 0 jour, elle
 * annonce ce qui commence (J1, v2.19), jamais un retard.
 */
export function StreakCard({ days }: { days: number }) {
  const start = days === 0;
  return (
    <View style={styles.shadow}>
      <View
        accessible
        accessibilityLabel={start ? fr.home.streakStartLabel : fr.common.streakLabel(days)}
        style={styles.card}>
        <Watermark icon="flamme" opacity={extras.watermarkOpacity.streak} offset={-20} />
        <View style={styles.pill}>
          <Icon name="flamme" size={22} color={theme.game.streak.background} />
        </View>
        <View style={styles.texts}>
          <Text variant="title" color="textOnColor" numberOfLines={1}>
            {start ? fr.home.streakStart : fr.home.streakDays(days)}
          </Text>
          <Text variant="caption" weight="bold" color="textOnColor" numberOfLines={1}>
            {start ? fr.home.streakStartCaption : fr.home.streakCaption}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Posée à cheval sur le bandeau : ombre orange (v2.17).
  shadow: { flex: 1, borderRadius: theme.radius['3xl'], boxShadow: liftShadow('orange') },
  card: {
    flex: 1,
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.game.streak.background,
    overflow: 'hidden',
  },
  pill: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { gap: 2 },
});
