import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/theme';

/**
 * Position de la barre flottante et espace à laisser sous le contenu.
 * Maquette : 20 px du bas. Sur Android, on remonte au-dessus de la barre système si besoin.
 */
export function useBottomNavLayout() {
  const insets = useSafeAreaInsets();
  const { inset, height } = theme.navigation;
  const bottom =
    Platform.OS === 'android' ? Math.max(inset, insets.bottom + theme.space[2]) : inset;
  return { bottom, clearance: bottom + height + theme.space[6] };
}
