import type { ReactNode } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/theme';

import { useBottomNavLayout } from './navigation/useBottomNavLayout';

type Props = {
  children: ReactNode;
  /** Écrans qui défilent (Accueil, Flashcards, Stats) ou écrans fixes (Tuteur). */
  scroll?: boolean;
  /** Laisse la place de la barre de navigation flottante. */
  withNav?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Bandeau de marque en tête (v2.5) : il occupe toute la largeur, et le contenu déborde dessus. */
  band?: ReactNode;
  /** Ce que le contenu recouvre du bandeau (56 px, 64 sur l'Accueil). */
  bandOverlap?: number;
};

/** Marge haute sur le web : celle des maquettes (56 px), faute de zone sûre. */
const WEB_TOP = 56;

/** Conteneur d'écran : zone sûre, marges de 20 px, dégagement de la barre flottante. */
export function ScreenContainer({
  children,
  scroll = true,
  withNav = true,
  contentStyle,
  band,
  bandOverlap = theme.screenBand.overlap,
}: Props) {
  const insets = useSafeAreaInsets();
  const { clearance } = useBottomNavLayout();
  if (band) {
    // Le bandeau porte la zone sûre du haut ; le contenu remonte sur lui (première carte).
    return (
      <ScrollView
        style={styles.fill}
        contentContainerStyle={{
          paddingBottom: withNav ? clearance : insets.bottom + theme.space[6],
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {band}
        <View
          style={[
            { marginTop: -bandOverlap, paddingHorizontal: theme.layout.screenPadding },
            contentStyle,
          ]}>
          {children}
        </View>
      </ScrollView>
    );
  }
  const padding: ViewStyle = {
    paddingTop: Platform.OS === 'web' ? WEB_TOP : insets.top + theme.layout.screenTopGap,
    paddingBottom: withNav ? clearance : insets.bottom + theme.space[6],
    paddingHorizontal: theme.layout.screenPadding,
  };
  if (!scroll) {
    return <View style={[styles.fill, padding, contentStyle]}>{children}</View>;
  }
  return (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={[padding, contentStyle]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: theme.colors.bg },
});
