import { StyleSheet, View } from 'react-native';

import { GameSwitch } from '@/components/game/GameSwitch';
import { GameText } from '@/components/game/GameText';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import type { AvatarLook } from '../logic/avatarLook';
import type { EditorControl } from '../logic/editor';
import { ChoiceChips } from './ChoiceChips';
import { ColorSwatches } from './ColorSwatches';
import { StepSlider } from './StepSlider';

const t = fr.avatar;

function shapeLabel(id: keyof typeof t.shapes, value: string): string {
  const labels: Readonly<Record<string, string>> = t.shapes[id];
  return labels[value] ?? value;
}

type Props = {
  control: EditorControl;
  look: AvatarLook;
  onChange: (look: AvatarLook) => void;
};

/** Un réglage de l'éditeur, avec son titre : formes, couleurs, curseur ou interrupteur. */
export function EditorControlView({ control, look, onChange }: Props) {
  const label = t.controls[control.id];
  if (control.kind === 'toggle') {
    return (
      <View style={styles.toggle}>
        <GameText size={16} stroke={2} drop={1} style={styles.toggleLabel}>
          {label}
        </GameText>
        <GameSwitch
          value={control.value(look)}
          onValueChange={(value) => onChange(control.set(look, value))}
          accessibilityLabel={label}
        />
      </View>
    );
  }
  return (
    <View style={styles.block}>
      <GameText size={16} stroke={2} drop={1} accessibilityRole="header">
        {label}
      </GameText>
      {control.kind === 'shape' ? (
        <ChoiceChips
          options={control.options.map((value) => ({
            value,
            label: shapeLabel(control.id, value),
          }))}
          value={control.value(look)}
          onChange={(value) => onChange(control.set(look, value))}
          accessibilityLabel={label}
        />
      ) : control.kind === 'color' ? (
        <ColorSwatches
          palette={control.palette}
          value={control.value(look)}
          onChange={(rank) => onChange(control.set(look, rank))}
          label={label}
        />
      ) : (
        <StepSlider
          value={control.value(look)}
          onChange={(value) => onChange(control.set(look, value))}
          label={label}
          ends={t.sliders[control.id]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: theme.space[2] },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: theme.space[12],
  },
  toggleLabel: { flex: 1 },
});
