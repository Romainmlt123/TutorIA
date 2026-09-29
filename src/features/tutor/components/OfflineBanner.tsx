import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

/** Mode hors ligne assumé : on le dit clairement et on propose de réessayer. */
export function OfflineBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <View accessibilityRole="alert" style={styles.banner}>
      <View style={styles.texts}>
        <Text variant="label" weight="bold" color="warningStrong">
          {fr.tutor.offlineTitle}
        </Text>
        <Text variant="caption" weight="regular" color="warningStrong">
          {fr.tutor.offlineBody}
        </Text>
      </View>
      <Button label={fr.tutor.retry} variant="small" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[3],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.warningSoft,
  },
  texts: { flex: 1, gap: 2 },
});
