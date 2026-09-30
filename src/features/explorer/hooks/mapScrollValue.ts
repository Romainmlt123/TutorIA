import { makeMutable } from 'react-native-reanimated';

/**
 * Position de la caméra le long de la carte d'une région (mètres), recopiée à chaque image par la
 * scène 3D. C'est une valeur partagée de Reanimated : les boutons et bandeaux posés sur la carte la
 * lisent sur le fil de l'interface et se placent sans repasser par React, même pendant un lancer.
 */
export const MAP_SCROLL_X = makeMutable(0);
