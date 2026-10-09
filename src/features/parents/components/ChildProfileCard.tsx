import { StyleSheet, View } from 'react-native';

import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { HeroCard } from './HeroCard';

type Props = { name: string; line: string; onEdit?: () => void };

/** P4 · Profil de l'enfant (HeroCard) : avatar blanc de 56 px et « Modifier ». */
export function ChildProfileCard({ name, line, onEdit }: Props) {
  return (
    <HeroCard icon="utilisateur" contentStyle={styles.content}>
      <View style={styles.avatar}>
        <Text variant="h3" weight="black" color="primary">
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.text}>
        <Text variant="h3" weight="black" color="textOnColor">
          {name}
        </Text>
        <Text variant="hint" weight="medium" color="textOnColor">
          {line}
        </Text>
      </View>
      {onEdit ? (
        <PressableBase onPress={onEdit} accessibilityRole="button" style={styles.edit}>
          <Text variant="label" weight="bold" color="textOnColor">
            {fr.parent.settings.edit}
          </Text>
        </PressableBase>
      ) : null}
    </HeroCard>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: theme.space[5],
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
  edit: {
    height: 44,
    paddingHorizontal: theme.space[4],
    borderRadius: 14,
    backgroundColor: theme.onColor.veil,
    justifyContent: 'center',
  },
});
