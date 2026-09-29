import { navigation, space } from './tokens.generated';

/** Mesures de mise en page communes aux écrans (design/README.md › Les écrans). */
export const layout = {
  /** Marge gauche et droite des écrans mobiles. */
  screenPadding: space[5],
  /** Espace ajouté sous la zone sûre en haut d'écran (≈ 56 px sur iPhone, comme les maquettes). */
  screenTopGap: space[2],
  /** Espace laissé libre en bas du contenu défilant pour ne pas passer sous la barre flottante. */
  navClearance: navigation.height + navigation.inset + space[6],
  /** Largeur maximale de la colonne sur le web, en attendant l'adaptation web complète. */
  webMaxWidth: 480,
  /** Zone tactile minimale. */
  minTouchSize: space[12],
} as const;
