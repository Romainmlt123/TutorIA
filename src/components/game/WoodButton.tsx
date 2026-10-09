import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import { GameText } from './GameText';
import { WOOD } from './WoodFrame';

const HUD = explorerArt.hud;
const WOOD_COLORS = HUD.wood;
const { depth: DEPTH, radius: RADIUS } = HUD.button;

type Props = {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  /** Icône après le libellé. */
  icon?: IconName;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Bouton de bois (HUD de jeu) : une planche du panneau « Ta quête », cadre sombre et biseau clair,
 * posée sur un rebord ; elle s'enfonce quand on appuie.
 */
export function WoodButton({ label, accessibilityLabel, onPress, icon, size = 48, style }: Props) {
  return (
    <PressableBase
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[{ height: size + DEPTH }, style]}>
      {({ pressed }) => (
        <>
          <View style={[styles.layer, styles.depth, { top: DEPTH, height: size }]} />
          <View style={[styles.layer, styles.face, { top: pressed ? DEPTH - 1 : 0, height: size }]}>
            <Image
              source={WOOD}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.bevel} />
            <View style={styles.content}>
              <GameText size={Math.round(size * 0.36)} align="center" numberOfLines={1}>
                {label}
              </GameText>
              {icon ? (
                <Icon
                  name={icon}
                  size={Math.round(size * 0.42)}
                  color={HUD.white}
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
    borderRadius: RADIUS,
    borderWidth: 2.5,
    borderColor: WOOD_COLORS.frame,
  },
  depth: { backgroundColor: WOOD_COLORS.groove },
  face: { overflow: 'hidden', backgroundColor: WOOD_COLORS.frame },
  bevel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: RADIUS - 2,
    borderWidth: 2,
    borderColor: WOOD_COLORS.bevel,
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
