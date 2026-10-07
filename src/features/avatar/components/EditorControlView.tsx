import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GameSwitch } from '@/components/game/GameSwitch';
import { GameText } from '@/components/game/GameText';
import { Parchment } from '@/components/game/WoodFrame';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import type { AvatarLook } from '../logic/avatarLook';
import type { EditorControl } from '../logic/editor';
import { canWear, WARDROBE, type Condition } from '../logic/wardrobe';
import { ChoiceChips } from './ChoiceChips';
import { ColorSwatches } from './ColorSwatches';
import { StepSlider } from './StepSlider';

const t = fr.avatar;

function shapeLabel(id: keyof typeof t.shapes, value: string): string {
  const labels: Readonly<Record<string, string>> = t.shapes[id];
  return labels[value] ?? value;
}

function itemLabel(item: string): string {
  const labels: Readonly<Record<string, string>> = t.items;
  return labels[item] ?? item;
}

function conditionText(condition: Condition): string {
  return condition.kind === 'streak'
    ? t.condition.streak(condition.days)
    : t.condition[condition.kind](condition.count);
}

/** Ce qu'il faut faire pour gagner un objet (rien pour un vêtement de base). */
function conditionOf(item: string): string | null {
  const entry = WARDROBE.find((w) => w.id === item);
  return entry ? conditionText(entry.condition) : null;
}

type Props = {
  control: EditorControl;
  look: AvatarLook;
  onChange: (look: AvatarLook) => void;
  /** Objets de la garde-robe déjà gagnés. */
  owned: ReadonlySet<string>;
};

type WearProps = Omit<Props, 'control'> & {
  control: Extract<EditorControl, { kind: 'wear' }>;
  label: string;
};

/** Un emplacement de la tenue : l'objet porté (les objets à gagner sont grisés) et sa couleur. */
function WearControl({ control, look, onChange, owned, label }: WearProps) {
  const [hint, setHint] = useState<string | null>(null);
  const worn = control.value(look);
  return (
    <View style={styles.block}>
      <GameText size={16} stroke={2} drop={1} accessibilityRole="header">
        {label}
      </GameText>
      {control.items.length > 1 ? (
        <ChoiceChips
          options={control.items.map((item) => {
            const locked = !canWear(item, owned);
            const condition = conditionOf(item);
            return {
              value: item,
              label: itemLabel(item),
              locked,
              accessibilityLabel:
                locked && condition ? t.locked(itemLabel(item), condition) : itemLabel(item),
            };
          })}
          value={worn.item}
          onChange={(item) => {
            setHint(null);
            onChange(control.setItem(look, item));
          }}
          onLocked={(item) => setHint(t.lockedHint(itemLabel(item), conditionOf(item) ?? ''))}
          accessibilityLabel={label}
        />
      ) : null}
      {hint ? <Parchment>{hint}</Parchment> : null}
      {worn.item === 'aucun' ? null : (
        <ColorSwatches
          palette={control.palette}
          value={worn.color}
          onChange={(rank) => onChange(control.setColor(look, rank))}
          label={`${label} · ${itemLabel(worn.item)}`}
        />
      )}
    </View>
  );
}

/** Un réglage de l'éditeur, avec son titre : formes, couleurs, curseur ou interrupteur. */
export function EditorControlView({ control, look, onChange, owned }: Props) {
  const label = t.controls[control.id];
  if (control.kind === 'wear') {
    return (
      <WearControl control={control} look={look} onChange={onChange} owned={owned} label={label} />
    );
  }
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
