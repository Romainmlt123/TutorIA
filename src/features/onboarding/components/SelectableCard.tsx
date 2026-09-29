import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon, type IconName } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { theme, type Gradient } from '@/theme';

type Props = {
  label: string;
  hint?: string;
  icon: IconName;
  gradient: Gradient;
  selected: boolean;
  onPress: () => void;
  /** `tile` : tuile de 112 px (GoalTile, O3). `row` : ligne de 72 px (ChoiceRow, O4). */
  layout: 'tile' | 'row';
  style?: StyleProp<ViewStyle>;
};

/**
 * Choix multiple coloré : cochée, la carte se remplit de son dégradé et sa pastille passe en voile blanc.
 * Même logique pour GoalTile (O3) et ChoiceRow (O4).
 */
export function SelectableCard({
  label,
  hint,
  icon,
  gradient,
  selected,
  onPress,
  layout,
  style,
}: Props) {
  const tile = layout === 'tile';
  const iconSize = tile ? 40 : 48;
  const pastille = (
    <GradientSurface
      gradient={selected ? { colors: [theme.onColor.veil], locations: [0] } : gradient}
      radius={tile ? 14 : theme.radius['2xl']}
      style={{ width: iconSize, height: iconSize }}
      contentStyle={styles.center}>
      <Icon name={icon} size={tile ? 20 : 22} color={theme.colors.textOnColor} />
    </GradientSurface>
  );
  const check = (
    <View
      style={[
        styles.check,
        tile ? styles.round : styles.square,
        selected ? styles.checkOn : styles.checkOff,
      ]}>
      {selected ? (
        <Icon name="coche" size={14} color={theme.palette.blue[600]} strokeWidth={3} />
      ) : null}
    </View>
  );
  const text: ReactNode = (
    <Text
      variant={tile ? 'lead' : 'rowTitle'}
      weight="black"
      color={selected ? 'textOnColor' : 'text'}>
      {label}
    </Text>
  );
  const body = tile ? (
    <View style={styles.tileContent}>
      <View style={styles.tileHead}>
        {pastille}
        {check}
      </View>
      {text}
    </View>
  ) : (
    <View style={styles.rowContent}>
      {pastille}
      <View style={styles.rowText}>
        {text}
        {hint ? (
          <Text
            variant="hint"
            weight="medium"
            color={selected ? 'textOnColor' : 'text'}
            style={styles.hint}>
            {hint}
          </Text>
        ) : null}
      </View>
      {check}
    </View>
  );
  return (
    <PressableBase
      onPress={onPress}
      role="checkbox"
      aria-checked={selected}
      accessibilityLabel={hint ? `${label}, ${hint}` : label}
      shadow={selected ? theme.shadow.lg : theme.shadow.sm}
      style={[styles.card, !selected && styles.idle, style]}>
      {selected ? (
        <GradientSurface gradient={gradient} contentStyle={styles.fill}>
          {body}
        </GradientSurface>
      ) : (
        body
      )}
    </PressableBase>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: theme.radius['3xl'] },
  idle: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  fill: { flexGrow: 1 },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  tileContent: {
    flexGrow: 1,
    minHeight: 112,
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  tileHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowContent: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: theme.space[3],
    paddingLeft: theme.space[3],
    paddingRight: theme.space[4],
  },
  rowText: { flex: 1, gap: 2 },
  hint: { opacity: 0.85 },
  check: {
    width: theme.space[6],
    height: theme.space[6],
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  round: { borderRadius: theme.radius.full },
  square: { borderRadius: theme.space[2] },
  checkOn: { borderColor: theme.colors.textOnColor, backgroundColor: theme.colors.textOnColor },
  checkOff: { borderColor: theme.palette.gray[200] },
});
