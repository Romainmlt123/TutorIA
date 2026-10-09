import { StyleSheet, View } from 'react-native';

import { GameText } from '@/components/game/GameText';
import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

const HUD = explorerArt.hud;
const FACE = 40;
const DEPTH = 4;

export type ChoiceOption = {
  value: string;
  label: string;
  /** Objet pas encore gagné : grisé, avec un cadenas ; le toucher explique comment l'obtenir. */
  locked?: boolean;
  /** Libellé pour les lecteurs d'écran, s'il diffère du texte affiché. */
  accessibilityLabel?: string;
};

type Props = {
  options: readonly ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
  onLocked?: (value: string) => void;
  /** Nom du groupe pour les lecteurs d'écran (« Yeux », « Coiffure »). */
  accessibilityLabel: string;
};

/**
 * Choix d'une forme parmi plusieurs, dans le style du HUD de jeu : des étiquettes de parchemin en
 * relief, la choisie dorée.
 */
export function ChoiceChips({ options, value, onChange, onLocked, accessibilityLabel }: Props) {
  return (
    <View role="radiogroup" accessibilityLabel={accessibilityLabel} style={styles.row}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableBase
            key={option.value}
            onPress={() => (option.locked ? onLocked?.(option.value) : onChange(option.value))}
            role="radio"
            aria-checked={selected}
            aria-disabled={option.locked}
            accessibilityLabel={option.accessibilityLabel ?? option.label}
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
                    option.locked && styles.faceLocked,
                    { top: pressed ? DEPTH - 1 : 0 },
                  ]}>
                  {selected ? (
                    <GameText size={15} align="center" stroke={2} drop={1} numberOfLines={1}>
                      {option.label}
                    </GameText>
                  ) : option.locked ? (
                    <View style={styles.lockedLabel}>
                      <Icon
                        name="cadenas"
                        size={14}
                        color={HUD.wood.parchmentInk}
                        strokeWidth={2.4}
                      />
                      <GameText
                        size={15}
                        align="center"
                        color={HUD.wood.parchmentInk}
                        stroke={0}
                        drop={0}
                        numberOfLines={1}>
                        {option.label}
                      </GameText>
                    </View>
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
                  style={[styles.sizer, option.locked && styles.sizerLocked]}
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
  faceLocked: { opacity: 0.6 },
  lockedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[1],
  },
  sizerLocked: { paddingLeft: theme.space[3] + 2 + 18 },
  sizer: {
    opacity: 0,
    paddingHorizontal: theme.space[3] + 2,
    height: FACE,
    justifyContent: 'center',
  },
});
