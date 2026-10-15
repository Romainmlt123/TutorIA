import { useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { extras, theme } from '@/theme';

import { GradientSurface } from './GradientSurface';

export type BandTone = 'student' | 'violet';

/** Pilule décorative : position dans le bandeau, taille, et opacité (`extras.bandPills`). */
type BandPill = { top: number; right: number; width: number; height: number; faint?: boolean };

/**
 * Pilules de chaque maquette : elles changent de place d'un écran à l'autre (le design ne les met
 * pas toutes en haut à droite). La plus discrète est `faint`.
 */
export const BAND_PILLS = {
  standard: [
    { top: 20, right: -48, width: 136, height: 44 },
    { top: 72, right: 56, width: 88, height: 32, faint: true },
  ],
  home: [
    { top: 148, right: -64, width: 120, height: 40 },
    { top: 204, right: 32, width: 88, height: 32, faint: true },
  ],
  flashcards: [
    { top: 20, right: 96, width: 104, height: 36, faint: true },
    { top: 116, right: -40, width: 128, height: 40 },
  ],
  parentsHome: [
    { top: 132, right: -48, width: 128, height: 40 },
    { top: 184, right: 40, width: 88, height: 32, faint: true },
  ],
  parentsLow: [
    { top: 20, right: -48, width: 136, height: 44 },
    { top: 124, right: 40, width: 88, height: 32, faint: true },
  ],
  drawer: [{ top: 8, right: -44, width: 136, height: 44 }],
  none: [],
} as const satisfies Record<string, readonly BandPill[]>;

type Props = {
  /** Bleu de l'élève (Accueil, Flashcards) ou violet de marque (Stats, espace Parents). */
  tone: BandTone;
  /** Ce que la première carte de l'écran recouvre en bas du bandeau (56 px, 64 sur l'Accueil). */
  overlap?: number;
  /** Place des pilules décoratives, celle de la maquette de l'écran. */
  pills?: keyof typeof BAND_PILLS;
  /**
   * Espace entre la barre d'état du téléphone et le contenu (sur le web : depuis le haut de la
   * page). Par défaut 24 px sur téléphone et 56 px sur le web, comme les maquettes.
   */
  topGap?: number;
  accessibilityLabel?: string;
  children: ReactNode;
};

/** Marge haute sur le web : celle des maquettes (56 px), faute de zone sûre. */
const WEB_TOP = 56;
/**
 * Sur téléphone, sous la barre d'état : assez d'air pour que le titre ne se colle pas à l'heure et à
 * la batterie (retour de Romain, 15/10).
 */
const NATIVE_TOP_GAP = 24;
/** Bas du bandeau resté visible sous la carte qui déborde. */
export const BAND_VISIBLE_BOTTOM = 32;

/**
 * Bandeau de marque (v2.5, design/COMPONENTS.md › ScreenBand) : dégradé à 170°, coins bas
 * arrondis, pilules décoratives placées comme sur la maquette de l'écran, contenu en blanc. Placé par `ScreenContainer` (prop `band`).
 */
export function ScreenBand({
  tone,
  overlap = theme.screenBand.overlap,
  pills = 'standard',
  topGap,
  accessibilityLabel,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  // Heure et batterie en blanc sur le dégradé, tant que l'écran est affiché (sombres ailleurs).
  const focused = useIsFocused();
  return (
    // Les coins bas sont rognés par ce conteneur : sur le web, le `borderRadius` de GradientSurface
    // écraserait des coins précisés après lui.
    <View role="region" accessibilityLabel={accessibilityLabel} style={styles.clip}>
      {focused ? <StatusBar style="light" /> : null}
      <GradientSurface
        gradient={theme.screenBand[tone]}
        angle={theme.screenBand.angle}
        radius={0}
        contentStyle={[
          styles.band,
          {
            paddingTop:
              Platform.OS === 'web' ? (topGap ?? WEB_TOP) : insets.top + (topGap ?? NATIVE_TOP_GAP),
            paddingBottom: overlap + BAND_VISIBLE_BOTTOM,
          },
        ]}>
        {BAND_PILLS[pills].map((pill: BandPill, i) => (
          <View
            key={i}
            aria-hidden
            style={[
              styles.pill,
              {
                top: pill.top,
                right: pill.right,
                width: pill.width,
                height: pill.height,
                borderRadius: pill.height / 2,
                backgroundColor: extras.bandPills[pill.faint ? 1 : 0],
              },
            ]}
          />
        ))}
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
});
