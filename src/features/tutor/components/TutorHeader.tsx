import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/theme';

/** Haut des écrans du tuteur : bascule Écrit / Vocal centrée, puis la carte du sujet. */
export function TutorHeader({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const top = Platform.OS === 'web' ? 56 : insets.top + theme.layout.screenTopGap;
  return <View style={[styles.header, { paddingTop: top }]}>{children}</View>;
}

const styles = StyleSheet.create({
  header: {
    // La bulle du vocal coupé (R7) passe au-dessus de la carte du sujet, posée juste dessous.
    zIndex: 2,
    alignItems: 'center',
    gap: theme.space[3],
    paddingHorizontal: theme.layout.screenPadding,
  },
});
