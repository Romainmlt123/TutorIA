import { StyleSheet, View } from 'react-native';

import { GameText } from '@/components/game/GameText';
import { PressableBase } from '@/components/PressableBase';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

const HUD = explorerArt.hud;
const FACE = 40;
const DEPTH = 4;

type Props = {
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  /** Nom du groupe pour les lecteurs d'écran (« Yeux », « Coiffure »). */
  accessibilityLabel: string;
};

/**
 * Choix d'une forme parmi plusieurs, dans le style du HUD de jeu : des étiquettes de parchemin en
 * relief, la choisie dorée.
 */
export function ChoiceChips({ options, value, onChange, accessibilityLabel }: Props) {
  return (
    <View role="radiogroup" accessibilityLabel={accessibilityLabel} style={styles.row}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableBase
            key={option.value}
            onPress={() => onChange(option.value)}
            role="radio"
            aria-checked={selected}
            accessibilityLabel={option.label}
            hitSlop={4}
            style={styles.chip}>
            {({ pressed }) => (
              <>
                <View style={[styles.layer, styles.depth, selected && styles.depthSelected]} />
                <View
                  style={[
                    styles.layer,
                    styles.face,
                    selected && styles.faceSelected,
                    { top: pressed ? DEPTH - 1 : 0 },
                  ]}>
                  {selected ? (
                    <GameText size={15} align="center" stroke={2} drop={1} numberOfLines={1}>
                      {option.label}
                    </GameText>
                  ) : (
                    <GameText
                      size={15}
                      align="center"
                      color={HUD.wood.parchmentInk}
                      stroke={0}
                      drop={0}
                      numberOfLines={1}>
                      {option.label}
                    </GameText>
                  )}
                </View>
                {/* Largeur prise par le libellé, invisible : la pastille s'adapte à son texte. */}
                <View
                  style={styles.sizer}
                  aria-hidden
                  importantForAccessibility="no-hide-descendants">
                  <GameText size={15} stroke={0} drop={0} numberOfLines={1}>
                    {option.label}
                  </GameText>
                </View>
              </>
            )}
          </PressableBase>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] },
  chip: { height: FACE + DEPTH },
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: FACE,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: HUD.ink,
  },
  depth: { top: DEPTH, backgroundColor: HUD.wood.parchmentBorder },
  depthSelected: { backgroundColor: HUD.buttons.yellow.depth },
  face: {
    backgroundColor: HUD.wood.parchment,
    justifyContent: 'center',
    paddingHorizontal: theme.space[3],
  },
  faceSelected: { backgroundColor: HUD.buttons.yellow.face[1] },
  sizer: {
    opacity: 0,
    paddingHorizontal: theme.space[3] + 2,
    height: FACE,
    justifyContent: 'center',
  },
});
