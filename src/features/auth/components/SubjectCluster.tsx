import { StyleSheet, View, type ViewStyle } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { subjectTheme, theme, type SubjectId } from '@/theme';

/** Tuiles des six matières autour du logo : position et inclinaison de la maquette L1. */
const TILES: readonly { subject: SubjectId; position: ViewStyle; rotate: number }[] = [
  { subject: 'maths', position: { left: 28, top: 36 }, rotate: -8 },
  { subject: 'francais', position: { left: 118, top: 8 }, rotate: 6 },
  { subject: 'histoire-geo', position: { right: 112, top: 30 }, rotate: -4 },
  { subject: 'physique-chimie', position: { right: 26, top: 4 }, rotate: 9 },
  { subject: 'svt', position: { left: 64, top: 124 }, rotate: 7 },
  { subject: 'anglais', position: { right: 58, top: 118 }, rotate: -7 },
];

/** Illustration décorative de L1 : les matières autour du logo. */
export function SubjectCluster() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.cluster}>
      {TILES.map(({ subject, position, rotate }) => {
        const { gradient, icon } = subjectTheme(subject);
        return (
          <GradientSurface
            key={subject}
            gradient={gradient}
            radius={18}
            shadow={theme.shadow.md}
            style={[styles.tile, position, { transform: [{ rotate: `${rotate}deg` }] }]}
            contentStyle={styles.center}>
            <Icon name={icon} size={26} color={theme.colors.textOnColor} />
          </GradientSurface>
        );
      })}
      <View style={styles.logo}>
        <Logo variant="onWhite" size={92} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cluster: { height: 176, width: '100%' },
  tile: { position: 'absolute', width: 56, height: 56 },
  center: { alignItems: 'center', justifyContent: 'center' },
  logo: {
    position: 'absolute',
    top: 64,
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
