import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon, type IconName } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import { GameText } from './GameText';

const HUD = explorerArt.hud;
/** Hauteur du rebord sous la face du bouton : la face s'y enfonce quand on appuie. */
const { depth: DEPTH, border: BORDER, radius: RADIUS } = HUD.button;

type Props = {
  tone: keyof typeof HUD.buttons;
  accessibilityLabel: string;
  onPress?: () => void;
  label?: string;
  /** Icône après le libellé, ou seule (bouton rond). */
  icon?: IconName;
  size?: number;
  round?: boolean;
  /** Onglet ou choix dans un groupe : annoncé comme tel, avec son état. */
  role?: 'button' | 'tab' | 'radio';
  selected?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Bouton de jeu (HUD d'Explorer) : face brillante en dégradé, cernée de bleu nuit, posée sur un
 * rebord plus sombre ; elle s'enfonce quand on appuie.
 */
export function GameButton({
  tone,
  accessibilityLabel,
  onPress,
  label,
  icon,
  size = 56,
  round = false,
  role = 'button',
  selected,
  disabled = false,
  style,
}: Props) {
  const colors = HUD.buttons[tone];
  const radius = round ? size / 2 : RADIUS;
  return (
    <PressableBase
      onPress={onPress}
      disabled={disabled}
      role={role}
      aria-selected={role === 'tab' ? selected : undefined}
      aria-checked={role === 'radio' ? selected : undefined}
      aria-disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      style={[
        { height: size + DEPTH },
        round ? { width: size } : null,
        disabled && styles.disabled,
        style,
      ]}>
      {({ pressed }) => (
        <>
          <View
            style={[
              styles.layer,
              { top: DEPTH, height: size, borderRadius: radius, backgroundColor: colors.depth },
            ]}
          />
          <View
            style={[
              styles.layer,
              styles.face,
              { top: pressed ? DEPTH - 1 : 0, height: size, borderRadius: radius },
            ]}>
            <GradientSurface
              gradient={colors.face}
              angle={180}
              radius={0}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.shine, { height: size * 0.42 }]} />
            <View style={styles.content}>
              {label ? (
                <GameText size={Math.round(size * 0.36)} align="center" numberOfLines={1}>
                  {label}
                </GameText>
              ) : null}
              {icon ? (
                <Icon
                  name={icon}
                  size={Math.round(size * 0.46)}
                  color={colors.icon}
                  strokeWidth={3}
                />
              ) : null}
            </View>
          </View>
        </>
      )}
    </PressableBase>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderWidth: BORDER,
    borderColor: HUD.ink,
  },
  face: { overflow: 'hidden' },
  disabled: { opacity: 0.55 },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: HUD.shine,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[2],
    paddingHorizontal: theme.space[4],
  },
});
