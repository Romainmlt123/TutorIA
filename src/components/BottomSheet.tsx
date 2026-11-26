import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { SlideInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { extras, theme } from '@/theme';

import { PressableBase } from './PressableBase';

/** Feuille du bas des maquettes (F3, B1) : coins de 32 px, ombre vers le haut, poignée. */
const S = theme.auth.sheet;
const ENTER_MS = 280;

type Props = {
  /** Toucher le voile ferme la feuille, comme le bouton retour d'Android. */
  onClose: () => void;
  closeLabel: string;
  accessibilityLabel: string;
  /** Espace entre les blocs de la feuille (12 en F3, 16 en B1). */
  gap?: number;
  children: ReactNode;
};

/**
 * Feuille du bas sur un voile sombre (choix de l'enfant F3, « Bientôt » B1). Elle monte à
 * l'ouverture, sauf si l'élève a demandé moins d'animations. Le voile vient du conteneur
 * (une `Modal` en fondu, ou un écran `transparentModal`).
 */
export function BottomSheet({
  onClose,
  closeLabel,
  accessibilityLabel,
  gap = theme.space[3],
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  return (
    <View style={styles.backdrop}>
      <PressableBase
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={closeLabel}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        entering={reduceMotion ? undefined : SlideInDown.duration(ENTER_MS)}
        role="dialog"
        aria-modal
        accessibilityLabel={accessibilityLabel}
        style={[styles.sheet, { gap, paddingBottom: S.paddingBottom + insets.bottom }]}>
        <View aria-hidden style={styles.handle} />
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: extras.backdrop },
  sheet: {
    paddingTop: theme.space[3],
    paddingHorizontal: S.paddingHorizontal,
    borderTopLeftRadius: S.radius,
    borderTopRightRadius: S.radius,
    backgroundColor: theme.colors.surface,
    boxShadow: S.shadow,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.border,
  },
});
