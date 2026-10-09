import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

type Props = {
  firstName: string;
  unreadNotifications: number;
  onNotifications: () => void;
  onProfile: () => void;
};

/** « Salut Léa ! », notifications (point violet = nouveauté) et avatar, dans le bandeau bleu. */
export function HomeHeader({ firstName, unreadNotifications, onNotifications, onProfile }: Props) {
  return (
    <View style={styles.header}>
      <Text variant="hero" color="textOnColor" accessibilityRole="header" style={styles.greeting}>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
  },
  greeting: { flex: 1 },
  avatar: {
    width: theme.space[12],
    height: theme.space[12],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
