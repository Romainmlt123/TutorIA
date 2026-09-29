import { StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { Icon } from '../Icon';
import { Text } from '../Text';

type Props = { message: string | null; tone?: 'warning' | 'success' };

/** Message d'un formulaire (erreur prévue ou confirmation), annoncé aux lecteurs d'écran. */
export function FormMessage({ message, tone = 'warning' }: Props) {
  if (!message) return null;
  const warning = tone === 'warning';
  return (
    <View
      accessibilityRole="alert"
      aria-live="polite"
      style={[
        styles.box,
        { backgroundColor: warning ? theme.colors.warningSoft : theme.colors.successSoft },
      ]}>
      <Icon
        name={warning ? 'alerte' : 'coche'}
        size={18}
        color={warning ? theme.colors.warningStrong : theme.colors.successStrong}
        strokeWidth={2}
      />
      <Text
        variant="bodySm"
        weight="medium"
        color={warning ? theme.colors.warningStrong : theme.colors.successStrong}
        style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.space[2],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius['2xl'],
  },
  text: { flex: 1 },
});
