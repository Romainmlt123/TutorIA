import { StyleSheet } from 'react-native';

import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import type { VisualKind } from '@/services/tutor/visuals';
import { theme } from '@/theme';
import { visualArt } from '@/theme/visualArt';

import { VISUAL_ICON } from './VisualPanel';

/** Hauteur de la pastille ; la zone touchable atteint 48 px grâce à `hitSlop`. */
const HEIGHT = 40;

/**
 * Pastille « Voir le graphique » sous une réponse du tuteur qui avait un visuel : un fond uni dans
 * la couleur d'accent du visuel, de la taille de son texte (jamais étirée dans la discussion).
 */
export function VisualChip({ kind, onPress }: { kind: VisualKind; onPress: () => void }) {
  const label = fr.tutor.visual.see[kind];
  return (
    <PressableBase
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={(48 - HEIGHT) / 2}
      style={[styles.chip, { backgroundColor: visualArt.kinds[kind].gradient[1] }]}>
      <Icon name={VISUAL_ICON[kind]} size={18} color={theme.colors.textOnColor} />
      <Text variant="bodySm" weight="bold" color="textOnColor" numberOfLines={1}>
        {label}
      </Text>
    </PressableBase>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    height: HEIGHT,
    marginLeft: theme.space[10],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.full,
  },
});
