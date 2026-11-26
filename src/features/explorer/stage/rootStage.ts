import { Platform } from 'react-native';

/**
 * Vrai sur Android seulement : la scène d'Explorer y est dessinée par l'hôte de la racine
 * (`ExplorerStageHost`), sous la pile de navigation, car Android détruit le contexte 3D d'une vue
 * que react-native-screens retire de la fenêtre (onglet caché, niveau ou avatar ouvert par-dessus).
 *
 * Sur iOS et le web, le contexte survit : la scène reste dans l'écran Explorer, comme avant. Elle
 * glisse alors avec son interface pendant les transitions (poussée d'un écran, balayage retour
 * d'iOS), au lieu de rester immobile sous elle.
 */
export const ROOT_STAGE = Platform.OS === 'android';

/**
 * Fond des seuls écrans à travers lesquels la scène de la racine se voit : l'espace élève (pile de
 * la racine) et son onglet Explorer. Tout autre écran garde le fond du thème (garde :
 * `opaqueScreens.test.ts`).
 */
export const SEE_THROUGH = { backgroundColor: 'transparent' } as const;
