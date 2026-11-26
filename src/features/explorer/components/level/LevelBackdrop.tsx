import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

const SKY = explorerArt.post.natural.sky;
const NIGHT = explorerArt.night;
/** Marge du haut sur le web (pas de zone sûre). */
const WEB_TOP = 56;
/** Étoiles de la maquette R6 : position (px), taille et opacité. */
const STARS = [
  [40, 120, 3, 0.8],
  [96, 70, 2, 0.6],
  [170, 140, 3, 0.7],
  [230, 60, 2, 0.5],
  [300, 210, 2, 0.6],
  [60, 250, 2, 0.5],
  [150, 220, 3, 0.6],
  [340, 300, 3, 0.7],
  [24, 360, 2, 0.5],
] as const;

type Props = {
  children: ReactNode;
  /** Ciel de nuit, avec la lune et les étoiles : la pause du soir (R6). */
  night?: boolean;
};

/**
 * Fond de ciel et marges des écrans d'un niveau. Le clavier remonte la saisie : sur Android, l'app
 * est affichée bord à bord et la fenêtre ne rétrécit plus quand il sort. `padding` ne compte que la
 * partie de l'écran réellement cachée par le clavier, sur les deux systèmes.
 */
export function LevelBackdrop({ children, night = false }: Props) {
  const insets = useSafeAreaInsets();
  const sky = night ? NIGHT : SKY;
  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: Platform.OS === 'web' ? WEB_TOP : insets.top + theme.layout.screenTopGap,
          paddingBottom: insets.bottom + theme.space[3],
        },
      ]}>
      <GradientSurface
        gradient={{ colors: [sky.top, sky.middle, sky.horizon], locations: [0, 0.55, 1] }}
        angle={180}
        radius={0}
        style={StyleSheet.absoluteFill}
      />
      {night ? (
        <View aria-hidden pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View style={styles.moon}>
            <Icon name="lune" size={64} color={NIGHT.moon} variant="fill" />
          </View>
          {STARS.map(([left, top, size, opacity]) => (
            <View
              key={`${left}-${top}`}
              style={[styles.star, { left, top, width: size, height: size, opacity }]}
            />
          ))}
        </View>
      ) : null}
      <KeyboardAvoidingView style={styles.content} behavior="padding">
        {children}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: {
    flex: 1,
    gap: theme.space[3],
    paddingHorizontal: theme.layout.screenPadding,
  },
  moon: { position: 'absolute', right: 44, top: 92 },
  star: { position: 'absolute', borderRadius: theme.radius.full, backgroundColor: NIGHT.star },
});
