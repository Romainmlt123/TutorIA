import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { PressableBase } from '@/components/PressableBase';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

const HUD = explorerArt.hud;
const WIDTH = 60;
const KNOB = 26;
const INSET = 3;

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
};

/** Interrupteur du HUD de jeu : piste creusée dans le bois, verte quand il est activé, bouton doré. */
export function GameSwitch({ value, onValueChange, accessibilityLabel }: Props) {
  return (
    <PressableBase
      onPress={() => onValueChange(!value)}
      role="switch"
      aria-checked={value}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={styles.track}>
      {value ? (
        <GradientSurface
          gradient={HUD.xp.fill}
          angle={180}
          radius={theme.radius.full}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={[styles.knob, { left: value ? WIDTH - KNOB - INSET * 2 - 2 : INSET - 1 }]}>
        <GradientSurface
          gradient={HUD.gold.face}
          angle={180}
          radius={theme.radius.full}
          style={StyleSheet.absoluteFill}
        />
      </View>
    </PressableBase>
  );
}

const styles = StyleSheet.create({
  track: {
    width: WIDTH,
    height: KNOB + INSET * 2 + 4,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: HUD.ink,
    backgroundColor: HUD.wood.groove,
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  knob: {
    position: 'absolute',
    width: KNOB,
    height: KNOB,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: HUD.ink,
    overflow: 'hidden',
  },
});
