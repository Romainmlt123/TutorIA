import { StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { Glow } from './Glow';
import { GradientSurface } from './GradientSurface';

const A = theme.auth;
/** Les deux halos des maquettes (L2, R1) : dégradés radiaux qui s'effacent aux deux tiers. */
const TOP = 420;
const BOTTOM = 380;
const FADE = 0.65;

/**
 * Fond de marque plein écran (connexion v2.7, pause v2.15) : le dégradé de l'espace et deux halos,
 * l'un blanc en haut à gauche, l'autre teinté en bas à droite.
 */
export function BrandBackdrop({ tone = 'student' }: { tone?: 'student' | 'parent' }) {
  return (
    <View aria-hidden pointerEvents="none" style={StyleSheet.absoluteFill}>
      <GradientSurface
        gradient={A.background[tone]}
        angle={A.angle}
        radius={0}
        style={StyleSheet.absoluteFill}
        contentStyle={styles.fill}
      />
      <Glow
        id="brand-glow-top"
        width={TOP}
        height={TOP}
        color={A.glows.top}
        fade={FADE}
        style={styles.top}
      />
      <Glow
        id={`brand-glow-${tone}`}
        width={BOTTOM}
        height={BOTTOM}
        color={A.glows[tone]}
        fade={FADE}
        style={styles.bottom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  top: { position: 'absolute', left: -120, top: -80 },
  bottom: { position: 'absolute', right: -160, bottom: 120 },
});
