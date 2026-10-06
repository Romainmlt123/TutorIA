/**
 * Palettes des avatars des élèves (figurines façon Mii, `src/features/avatar`). L'avatar enregistre
 * des rangs dans ces listes, jamais des couleurs : on peut retoucher une teinte sans toucher aux
 * avatars déjà créés, mais on n'en retire jamais (on ajoute à la fin).
 */
export const avatarArt = {
  /** Peaux, de la plus claire à la plus foncée. */
  skins: [
    '#f8dcc8',
    '#f1c6a3',
    '#e9b48f',
    '#e2a87e',
    '#c98b62',
    '#a86a45',
    '#8a5534',
    '#7a4a2e',
    '#5c3a26',
    '#3f281a',
  ],
  hairs: [
    '#151110',
    '#2d1d14',
    '#5a3a22',
    '#8a5a32',
    '#c08a4a',
    '#e3c27a',
    '#b8452c',
    '#e07a3a',
    '#9aa0a8',
    '#f2efe8',
    '#5b7fe0',
    '#e06aa8',
  ],
  eyes: ['#2a2420', '#5a3a22', '#3d6fb5', '#3f8a5a', '#8a6a3a', '#6a6f78'],
  /** Couleurs des vêtements. */
  cloths: [
    '#3f7fd8',
    '#e2574c',
    '#f2b631',
    '#2fa36b',
    '#7a5cc8',
    '#f08bb0',
    '#4cb5c8',
    '#ef8a3a',
    '#2f3b55',
    '#5b3c2c',
    '#f2f2ee',
    '#2a2a2e',
    // Ajoutées avec la garde-robe : sable (chapeau d'explorateur).
    '#c8b07a',
  ],
  /** Couleurs fixes : semelle, intérieur de la bouche, langue, dents, reflet des yeux, joues, détails. */
  sole: '#f4f1ea',
  mouth: '#5a1f22',
  tongue: '#e0707a',
  teeth: '#fbf8f2',
  sclera: '#fbf8f2',
  highlight: '#ffffff',
  line: '#2a2420',
  blush: '#f19a8e',
  /** Détails fixes de la garde-robe : bandeau du chapeau, sangles du sac (brun sombre). */
  detail: '#3b3128',
  /** Lumière des scènes où paraît un avatar : ciel, sol, soleil (sa direction suit la cuisson des îles). */
  light: { sky: '#f4f8ff', ground: '#d8cdb8', sun: '#fff1dc', fill: '#e8f0ff' },
  /** Ombre douce sous les pieds de la figurine (aperçu de l'éditeur). */
  shadow: '#1c2a4d',
} as const;
