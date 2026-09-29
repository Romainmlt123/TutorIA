import { StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { PressableBase } from './PressableBase';
import { Text } from './Text';

export type SegmentOption<T extends string> = { value: T; label: string; icon?: IconName };

export type SegmentedControlProps<T extends string> = {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Nom du groupe pour les lecteurs d'écran (« Mode de discussion », « Période »). */
  accessibilityLabel: string;
  /** Colonnes égales sur toute la largeur (Stats). */
  fullWidth?: boolean;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  fullWidth = false,
}: SegmentedControlProps<T>) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[styles.container, fullWidth ? styles.fullWidth : styles.compact]}>
      {options.map((option) => {
        const selected = option.value === value;
        const color = selected ? theme.colors.textOnColor : theme.colors.textSecondary;
        return (
          <PressableBase
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            aria-selected={selected}
            hitSlop={theme.space[1]}
            style={[styles.segment, fullWidth && styles.segmentFull, selected && styles.selected]}>
            {option.icon ? <Icon name={option.icon} size={18} color={color} /> : null}
            <Text variant="label" color={color} numberOfLines={1} maxFontSizeMultiplier={1.4}>
              {option.label}
            </Text>
          </PressableBase>
        );
      })}
    </View>
  );
}

const SEGMENT_HEIGHT = 40;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.space[1],
    padding: theme.space[1],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.sm,
  },
  compact: { alignSelf: 'center' },
  fullWidth: { alignSelf: 'stretch' },
  segment: {
    height: SEGMENT_HEIGHT,
    paddingHorizontal: theme.space[5],
    borderRadius: SEGMENT_HEIGHT / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[2],
  },
  segmentFull: { flex: 1, paddingHorizontal: theme.space[2] },
  selected: { backgroundColor: theme.colors.primary },
});
