import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { extras, theme } from '@/theme';

import { PressableBase } from '../PressableBase';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
};

const TRACK_WIDTH = 52;
const KNOB = theme.space[6];
const INSET = theme.space[1];

/** Interrupteur 52 × 32 : piste `primary` activée, `gray-200` désactivée, transition de 200 ms. */
export function Switch({ value, onValueChange, accessibilityLabel, disabled = false }: Props) {
  return (
    <PressableBase
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      role="switch"
      aria-checked={value}
      aria-disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={[styles.track, disabled && styles.disabled]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.fill,
          { backgroundColor: value ? theme.colors.primary : theme.palette.gray[200] },
        ]}
      />
      <Animated.View style={[styles.knob, { left: value ? TRACK_WIDTH - KNOB - INSET : INSET }]} />
    </PressableBase>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: theme.space[8],
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    flexShrink: 0,
  },
  fill: {
    borderRadius: theme.radius.full,
    transitionProperty: 'backgroundColor',
    transitionDuration: 200,
  },
  knob: {
    position: 'absolute',
    top: INSET,
    width: KNOB,
    height: KNOB,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    boxShadow: extras.switchKnobShadow,
    transitionProperty: 'left',
    transitionDuration: 200,
  },
  disabled: { opacity: 0.4 },
});
