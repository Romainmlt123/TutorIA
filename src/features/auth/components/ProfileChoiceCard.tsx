import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { Watermark } from '@/components/Watermark';
import { extras, theme, type SpaceTone } from '@/theme';

type Props = {
  tone: SpaceTone;
  title: string;
  selected: boolean;
  onPress: () => void;
};

/** Carte de choix du profil (L1) : dégradé de l'espace, double anneau et coche une fois choisie. */
export function ProfileChoiceCard({ tone, title, selected, onPress }: Props) {
  const space = theme.spaces[tone];
  const icon = tone === 'parent' ? 'famille' : 'casquette';
  return (
    <PressableBase
      onPress={onPress}
      role="radio"
      aria-checked={selected}
      accessibilityLabel={title}
      shadow={selected ? extras.selectionRing(space.ink) : theme.shadow.md}
      style={styles.card}>
      <GradientSurface gradient={space.gradient} contentStyle={styles.content}>
        <Watermark icon={icon} size={140} offset={-34} opacity={0.14} />
        <View style={styles.iconTile}>
          <Icon name={icon} size={28} color={theme.colors.textOnColor} />
        </View>
        <Text variant="title" color="textOnColor" style={styles.title}>
          {title}
        </Text>
        <View style={[styles.radio, selected && styles.radioOn]}>
          {selected ? <Icon name="coche" size={16} color={space.ink} strokeWidth={3} /> : null}
        </View>
      </GradientSurface>
    </PressableBase>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: theme.radius['3xl'] },
  content: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[4],
    paddingVertical: theme.space[5],
    paddingHorizontal: theme.space[5],
  },
  iconTile: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.onColor.veil,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, lineHeight: 30 },
  radio: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.textOnColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: theme.colors.textOnColor },
});
