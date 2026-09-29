import { StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { theme } from '@/theme';

type Props = { label: string; icon: IconName; selected: boolean; onPress: () => void };

/** Puce de 52 px à cocher (moment de révision, O4) : bordure `primary` et fond doux une fois cochée. */
export function ToggleChip({ label, icon, selected, onPress }: Props) {
  const color = selected ? theme.palette.blue[600] : theme.colors.text;
  return (
    <PressableBase
      onPress={onPress}
      role="checkbox"
      aria-checked={selected}
      accessibilityLabel={label}
      shadow={selected ? undefined : theme.shadow.sm}
      style={[styles.chip, selected ? styles.on : styles.off]}>
      <Icon name={icon} size={18} color={color} strokeWidth={2} />
      <Text variant="lead" weight="bold" color={color} numberOfLines={1}>
        {label}
      </Text>
    </PressableBase>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    paddingHorizontal: 14,
    borderRadius: theme.radius['2xl'],
  },
  on: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  off: { borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
});
