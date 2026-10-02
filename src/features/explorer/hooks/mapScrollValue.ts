import { makeMutable } from 'react-native-reanimated';

/**
 * Point de la carte d'une région au centre de l'écran (mètres), recopié à chaque image par la scène
 * 3D. Ce sont des valeurs partagées de Reanimated : les boutons et bandeaux posés sur la carte les
 * lisent sur le fil de l'interface et se placent sans repasser par React, même pendant un lancer.
 */
export const MAP_SCROLL_X = makeMutable(0);
export const MAP_SCROLL_Z = makeMutable(0);
