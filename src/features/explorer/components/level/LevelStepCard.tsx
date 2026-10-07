import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { theme } from '@/theme';

/** Carte verte « Étape réussie » de la discussion d'une leçon (X4), alignée sur les bulles du tuteur. */
export function LevelStepCard({ text }: { text: string }) {
  return (
    <View accessible accessibilityLabel={text} style={styles.card}>
      <View style={styles.icon}>
        <Icon name="coche" size={18} strokeWidth={2.6} color={theme.colors.textOnColor} />
      </View>
      <Text variant="bodySm" weight="bold" color="successStrong" style={styles.text}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'flex-start',
    maxWidth: 310,
    marginLeft: theme.space[10],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.successSoft,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.success,
  },
  text: { flex: 1 },
});
