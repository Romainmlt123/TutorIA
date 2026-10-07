import { ScrollView, StyleSheet } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon, type IconName } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { extras, theme } from '@/theme';

type Starter = keyof typeof extras.chatStarterGradients;

const STARTERS: readonly { id: Starter; icon: IconName }[] = [
  { id: 'notion', icon: 'ampoule' },
  { id: 'exercise', icon: 'crayon' },
  { id: 'review', icon: 'cartes' },
  { id: 'graph', icon: 'graphique' },
];

/** Hauteur d'une suggestion ; la zone touchable atteint 48 px grâce à `hitSlop`. */
const HEIGHT = 40;

/**
 * Idées de départ d'une discussion libre encore vide : des suggestions colorées qui défilent sur le
 * côté, au-dessus de la saisie ; un toucher envoie la demande au tuteur.
 */
export function ChatStarters({ onPick }: { onPick: (message: string) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      accessibilityLabel={fr.tutor.chat.startersLabel}
      contentContainerStyle={styles.row}>
      {STARTERS.map(({ id, icon }) => {
        const starter = fr.tutor.chat.starters[id];
        return (
          <PressableBase
            key={id}
            onPress={() => onPick(starter.message)}
            accessibilityRole="button"
            accessibilityLabel={starter.label}
            hitSlop={(48 - HEIGHT) / 2}
            style={({ pressed }) => pressed && styles.pressed}>
            <GradientSurface
              gradient={extras.chatStarterGradients[id]}
              angle={90}
              radius={theme.radius.full}
              shadow={theme.shadow.sm}
              contentStyle={styles.chip}>
              <Icon name={icon} size={16} color={theme.colors.textOnColor} />
              <Text variant="bodySm" weight="bold" color="textOnColor" numberOfLines={1}>
                {starter.label}
              </Text>
            </GradientSurface>
          </PressableBase>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: theme.space[2],
    paddingHorizontal: theme.layout.screenPadding,
    paddingVertical: theme.space[1],
  },
  pressed: { opacity: 0.85 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    height: HEIGHT,
    paddingHorizontal: theme.space[4],
  },
});
