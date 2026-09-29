import { StyleSheet, View } from 'react-native';

import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { Icon } from './Icon';
import { Text } from './Text';

/** Badge de série : orange uni, flamme blanche, jamais de dégradé. */
export function StreakBadge({ days, size = 'md' }: { days: number; size?: 'sm' | 'md' }) {
  return (
    <View
      accessible
      accessibilityLabel={fr.common.streakLabel(days)}
      style={[styles.badge, size === 'sm' && styles.small]}>
      <Icon name="flamme" size={16} color={theme.game.streak.text} />
      <Text
        variant="label"
        weight="bold"
        color={theme.game.streak.text}
        maxFontSizeMultiplier={1.3}>
        {String(days)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: 32,
    paddingHorizontal: theme.space[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[1],
    borderRadius: theme.radius.full,
    backgroundColor: theme.game.streak.background,
  },
  // Révision du jour : padding 4 × 12, hauteur du texte (28 px).
  small: { height: 28 },
});
