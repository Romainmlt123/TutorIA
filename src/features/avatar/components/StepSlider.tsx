import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GameButton } from '@/components/game/GameButton';
import { GameText } from '@/components/game/GameText';
import { GradientSurface } from '@/components/GradientSurface';
import { PressableBase } from '@/components/PressableBase';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import { nudge, SLIDER_STEPS, snap } from '../logic/editor';

const HUD = explorerArt.hud;
const KNOB = 26;

type Props = {
  /** Valeur de 0 à 1, par crans de 1/10. */
  value: number;
  onChange: (value: number) => void;
  label: string;
  /** Les deux bouts du curseur et les libellés des boutons − et +. */
  ends: { min: string; max: string; less: string; more: string };
};

/**
 * Curseur à crans du HUD de jeu : boutons − et + en relief, jauge creusée dans le bois qu'on touche
 * pour aller directement à une position, et bouton doré. Les lecteurs d'écran le règlent comme un
 * curseur (balayage vers le haut ou le bas).
 */
export function StepSlider({ value, onChange, label, ends }: Props) {
  const [width, setWidth] = useState(0);
  const step = Math.round(snap(value) * SLIDER_STEPS);
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{
        min: 0,
        max: SLIDER_STEPS,
        now: step,
        text: fr.avatar.sliderValue(step, SLIDER_STEPS),
      }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) =>
        onChange(nudge(value, event.nativeEvent.actionName === 'increment' ? 1 : -1))
      }
      style={styles.block}>
      <View style={styles.row}>
        <GameButton
          tone="blue"
          round
          size={44}
          icon="moins"
          accessibilityLabel={ends.less}
          onPress={() => onChange(nudge(value, -1))}
        />
        <PressableBase
          accessible={false}
          onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
          onPress={(event) => {
            if (width > 0) onChange(snap(event.nativeEvent.locationX / width));
          }}
          style={styles.track}>
          <View style={styles.groove}>
            {step > 0 ? (
              <GradientSurface
                gradient={HUD.xp.fill}
                angle={180}
                radius={theme.radius.full}
                style={[styles.fill, { width: `${step * (100 / SLIDER_STEPS)}%` }]}
              />
            ) : null}
          </View>
          <View
            style={[styles.knob, { left: Math.max(0, (width - KNOB) * (step / SLIDER_STEPS)) }]}>
            <GradientSurface
              gradient={HUD.gold.face}
              angle={180}
              radius={theme.radius.full}
              style={StyleSheet.absoluteFill}
            />
          </View>
        </PressableBase>
        <GameButton
          tone="blue"
          round
          size={44}
          icon="plus"
          accessibilityLabel={ends.more}
          onPress={() => onChange(nudge(value, 1))}
        />
      </View>
      <View style={styles.ends} importantForAccessibility="no-hide-descendants">
        <GameText size={12} stroke={2} drop={0}>
          {ends.min}
        </GameText>
        <GameText size={12} stroke={2} drop={0}>
          {ends.max}
        </GameText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: theme.space[1] },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  track: { flex: 1, height: theme.space[12], justifyContent: 'center' },
  groove: {
    height: 16,
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: HUD.ink,
    backgroundColor: HUD.wood.groove,
  },
  fill: { height: '100%' },
  knob: {
    position: 'absolute',
    width: KNOB,
    height: KNOB,
    borderRadius: theme.radius.full,
    borderWidth: 2.5,
    borderColor: HUD.ink,
    overflow: 'hidden',
  },
  ends: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 44 + theme.space[3],
  },
});
