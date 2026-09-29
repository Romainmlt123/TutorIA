import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { StreakBadge } from '@/components/StreakBadge';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

type Props = { title: string; subtitle: string; streakDays: number; onQuit: () => void };

/** En-tête de session : « Quitter », matière et position, badge de série. */
export function SessionTopBar({ title, subtitle, streakDays, onQuit }: Props) {
  return (
    <View style={styles.bar}>
      <PressableBase accessibilityRole="button" onPress={onQuit} style={styles.quit}>
        <Icon name="chevron-gauche" size={22} color={theme.colors.text} strokeWidth={2} />
        <Text variant="body" weight="bold">
          {fr.flashcards.quit}
        </Text>
      </PressableBase>
      <View style={styles.title}>
        <Text variant="body" weight="black" numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
        <Text variant="caption" weight="regular" color="textSecondary">
          {subtitle}
        </Text>
      </View>
      <View style={styles.side}>
        <StreakBadge days={streakDays} />
      </View>
    </View>
  );
}

const SIDE = 96;

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] },
  quit: {
    width: SIDE,
    height: theme.space[12],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[1],
  },
  title: { flex: 1, alignItems: 'center' },
  side: { width: SIDE, alignItems: 'flex-end' },
});
