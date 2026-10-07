import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { extras, theme } from '@/theme';

import { GradientSurface } from './GradientSurface';

export type BandTone = 'student' | 'violet';

type Props = {
  /** Bleu de l'élève (Accueil, Flashcards) ou violet de marque (Stats, espace Parents). */
  tone: BandTone;
  /** Ce que la première carte de l'écran recouvre en bas du bandeau (56 px, 64 sur l'Accueil). */
  overlap?: number;
  accessibilityLabel?: string;
  children: ReactNode;
};

/** Marge haute sur le web : celle des maquettes (56 px), faute de zone sûre. */
const WEB_TOP = 56;
/** Bas du bandeau resté visible sous la carte qui déborde. */
const VISIBLE_BOTTOM = 32;

/**
 * Bandeau de marque (v2.5, design/COMPONENTS.md › ScreenBand) : dégradé à 170°, coins bas
 * arrondis, deux pilules décoratives, contenu en blanc. Placé par `ScreenContainer` (prop `band`).
 */
export function ScreenBand({
  tone,
  overlap = theme.screenBand.overlap,
  accessibilityLabel,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    // Les coins bas sont rognés par ce conteneur : sur le web, le `borderRadius` de GradientSurface
    // écraserait des coins précisés après lui.
    <View role="region" accessibilityLabel={accessibilityLabel} style={styles.clip}>
      <GradientSurface
        gradient={theme.screenBand[tone]}
        angle={theme.screenBand.angle}
        radius={0}
        contentStyle={[
          styles.band,
          {
            paddingTop: Platform.OS === 'web' ? WEB_TOP : insets.top + theme.layout.screenTopGap,
            paddingBottom: overlap + VISIBLE_BOTTOM,
          },
        ]}>
        <View aria-hidden style={[styles.pill, styles.pillLarge]} />
        <View aria-hidden style={[styles.pill, styles.pillSmall]} />
        {children}
      </GradientSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
    borderBottomLeftRadius: theme.screenBand.radiusBottom,
    borderBottomRightRadius: theme.screenBand.radiusBottom,
  },
  band: { gap: theme.space[3], paddingHorizontal: theme.layout.screenPadding },
  pill: { position: 'absolute' },
  pillLarge: {
    top: theme.space[5],
    right: -48,
    width: 136,
    height: 44,
    borderRadius: 22,
    backgroundColor: extras.bandPills[0],
  },
  pillSmall: {
    top: 72,
    right: 56,
    width: 88,
    height: 32,
    borderRadius: 16,
    backgroundColor: extras.bandPills[1],
  },
});
