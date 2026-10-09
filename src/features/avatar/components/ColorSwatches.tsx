import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

const HUD = explorerArt.hud;
const SWATCH = 38;

type Props = {
  palette: readonly string[];
  /** Rang de la couleur choisie dans la palette. */
  value: number;
  onChange: (rank: number) => void;
  /** Nom du réglage (« Couleur des yeux ») : chaque pastille s'annonce « teinte 3 sur 12 ». */
  label: string;
};

/** Choix d'une couleur : des pastilles rondes cernées de bleu nuit, la choisie dans un anneau doré. */
export function ColorSwatches({ palette, value, onChange, label }: Props) {
  return (
    <View role="radiogroup" accessibilityLabel={label} style={styles.row}>
      {palette.map((hex, rank) => {
        const selected = rank === value;
        return (
          <PressableBase
            key={hex}
            onPress={() => onChange(rank)}
            role="radio"
            aria-checked={selected}
            accessibilityLabel={fr.avatar.color(label, rank + 1, palette.length)}
            style={[styles.target, selected && styles.selected]}>
            <View style={[styles.swatch, { backgroundColor: hex }]}>
              {selected ? (
                <View style={styles.check}>
                  <Icon name="coche" size={14} color={HUD.ink} strokeWidth={3.5} />
                </View>
              ) : null}
            </View>
          </PressableBase>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[1] },
  target: {
    width: theme.space[12],
    height: theme.space[12],
    borderRadius: theme.radius.full,
    borderWidth: 3,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { borderColor: HUD.gold.face[1], backgroundColor: HUD.ink },
  swatch: {
    width: SWATCH,
    height: SWATCH,
    borderRadius: theme.radius.full,
    borderWidth: 2.5,
    borderColor: HUD.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: theme.radius.full,
    backgroundColor: HUD.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
