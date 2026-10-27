import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import type { CallWarning } from '../../logic/callWarning';

/**
 * « Plus que 2 minutes » au-dessus des commandes (v2.15) : toujours visible, même sous-titres
 * coupés, et annoncée aux lecteurs d'écran.
 */
export function CallWarningPill({ warning }: { warning: CallWarning }) {
  const label = fr.tutor.call.warning[warning];
  return (
    <View
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={label}
      style={styles.pill}>
      <Icon name="horloge" size={16} color={theme.colors.textOnColor} strokeWidth={2} />
      <Text variant="label" weight="bold" color="textOnColor">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    height: 36,
    paddingLeft: theme.space[3],
    paddingRight: theme.space[4],
    borderRadius: theme.radius.full,
    backgroundColor: theme.voiceCall.status.neutral,
  },
});
