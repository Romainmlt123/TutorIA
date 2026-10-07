/**
 * Palette du monde d'Explorer (HD-2D) : îles, cartes, sprites, ciels et lumières.
 * Volontairement libre par rapport aux couleurs de la marque (validé par Romain) : des rampes
 * riches et chaudes, façon jeu vidéo. L'interface posée par-dessus garde le design system.
 * Chaque rampe va du ton le plus sombre au plus clair (6 tons, comme en pixel art).
 */
export const explorerArt = {
  ramps: {
    green: ['#173d1f', '#23592a', '#2f7a33', '#4a9a3c', '#79bd4f', '#b9e07a'],
    dirt: ['#2e1a0e', '#4a2c16', '#6b4222', '#8c5a30', '#b07a45', '#d6a86c'],
    deepDirt: ['#1f120a', '#33200f', '#4a2f18', '#633f21', '#7d532d', '#9c6b3d'],
    rock: ['#2d313b', '#434957', '#5d6474', '#7e8697', '#a4abba', '#ced3de'],
    wood: ['#46290f', '#6b411c', '#915d2b', '#b8813f', '#d8a95e', '#f1d192'],
    blue: ['#0b2466', '#153e99', '#225dc4', '#3b80e4', '#6fa8f3', '#bcd9ff'],
    violet: ['#2a124f', '#44218a', '#6436b8', '#8759d9', '#ae8cef', '#dccdfd'],
    cyan: ['#053a44', '#0a6270', '#118a97', '#27b0bb', '#6ad3d6', '#c0f1ef'],
    water: ['#0c3f7a', '#1459a3', '#1f78cc', '#3e9ae6', '#7fc3f5', '#dbf1ff'],
    white: ['#8a8f9e', '#aab0bd', '#c8ccd6', '#e1e4ea', '#f3f4f7', '#ffffff'],
    gold: ['#5a3a06', '#8a5c0d', '#b98317', '#e0ac2c', '#f6cf5a', '#fff0a8'],
  },
  light: { sun: '#ffe2a8', skyFill: '#dbeaff', groundFill: '#8a73c9', rim: '#bff0ff' },
  grade: { shadows: '#9c8ce0', highlights: '#ffe6b8' },
  crystals: ['#62e6f0', '#b98cff', '#74b4ff'],
  dust: '#fff0c8',
  fog: '#d6e8ff',
  /** 3D réaliste : eau, nuages vaporeux, chiffres lumineux de la cascade. */
  water3d: {
    deep: '#1f5570',
    shallow: '#4f8a82',
    sky: '#b7d0e6',
    foam: '#eef3f1',
    glow: '#fff6dc',
  },
  cloud: { top: '#ffffff', bottom: '#b9c8dc' },
  grassBlades: { base: '#34491f', tip: '#8fa04a', dry: '#b0a765' },
  digit: '#f2fbff',
  /** Régions de l'île des Maths (X2a) : teinte sur l'herbe et couleur des panneaux. */
  regions: {
    'maths-nombres': '#4f86e8',
    'maths-donnees': '#e89a2c',
    'maths-espace': '#9163e0',
    'maths-algo': '#1fb3a6',
  },
  /** Carte d'une région (X2b) : terre flottante, chemin et points de niveau par type et par état. */
  map: {
    land: '#79ad49',
    cliff: '#7b5636',
    /** Planches du chemin : bois miel jusqu'au pion, bois grisé ensuite, et le fil du bois. */
    planks: { done: '#c98f52', todo: '#9b948a', grain: '#6e4a2a' },
    /** Ombre douce posée sous les rochers, galets, monuments et l'avatar. */
    groundShadow: '#16240e',
    node: { lecon: '#2fbf5f', exercices: '#3f86f0', evaluation: '#e0504f', locked: '#aab2c0' },
    /** Rebord doré et lumineux des points de niveau (gris pour un niveau fermé), et leur halo. */
    nodeRim: { light: '#fff3a3', face: '#ffc933', dark: '#c98600', glow: '#ffd84a' },
    nodeRimLocked: { light: '#f1f3f7', face: '#d3d8e1', dark: '#8f98a8' },
    village: { wall: '#f5ead2', roof: '#d9733c' },
  },
  /** Pointillé des frontières de région. */
  regionBorder: '#ffffff',
  /**
   * HUD de l'onglet Explorer, façon jeu vidéo : textes blancs cernés de bleu nuit, boutons brillants
   * en relief (face en dégradé, rebord plus sombre dessous), gemmes et médaille dorée.
   */
  hud: {
    ink: '#16244f',
    shadow: 'rgba(12, 22, 60, 0.35)',
    white: '#ffffff',
    shine: 'rgba(255, 255, 255, 0.38)',
    buttons: {
      yellow: { face: ['#ffe872', '#ffc21f'], depth: '#c98600', icon: '#5a3600' },
      green: { face: ['#7ee86d', '#2fb84a'], depth: '#1b7f33', icon: '#ffffff' },
      /** Boutons secondaires des écrans de jeu (onglets non choisis, − et + des curseurs). */
      blue: { face: ['#7fb0ff', '#3f7be8'], depth: '#1f4fb5', icon: '#ffffff' },
    },
    streak: { face: ['#ffb23f', '#f07a12'], depth: '#b8520a' },
    gold: { face: ['#fff09a', '#ffc933', '#f0a500'], depth: '#b87400' },
    xp: { track: '#16244f', fill: ['#8cf57e', '#2fd35a'] },
    panel: { tab: ['#5b95ff', '#2e6be6'] },
    /** Panneau « Ta quête » en bois (texture rendue par Blender : tools/explorer-3d/wood_panel.py). */
    wood: {
      frame: '#3f230d',
      bevel: 'rgba(255, 220, 170, 0.45)',
      groove: '#2d1808',
      nail: ['#fbfbfb', '#9c9c9c'],
      parchment: '#fff2d9',
      parchmentBorder: '#caa06a',
      parchmentInk: '#5b3713',
    },
    gem: '#ffffff',
    /** Voile gris sur les cartes de région non choisies du carrousel. */
    grayVeil: 'rgba(120, 128, 142, 0.62)',
    /** Fondu au noir qui cache le passage d'une scène à l'autre (île ↔ carte d'une région). */
    blackVeil: '#04060c',
    /** Pastilles d'état des panneaux de région (X2a). */
    status: {
      discover: { face: '#dce8ff', ink: '#1f3a78' },
      current: { face: '#5b95ff', ink: '#ffffff' },
      consolidate: { face: '#ffb23f', ink: '#5a3200' },
      done: { face: '#46d06f', ink: '#0d3a1c' },
    },
    /** Règle de l'évaluation sur la fiche d'un niveau (X3b) : le tuteur n'aide pas. */
    rule: { face: '#ffe3dc', border: '#e0504f', ink: '#7a1d14' },
    /** Fiche et bilan d'un niveau : voile sur la carte, médaille d'XP. */
    sheetVeil: 'rgba(9, 17, 34, 0.45)',
    /** Géométrie des boutons en relief : rebord, contour, arrondi. */
    button: { depth: 5, border: 2.5, radius: 18 },
  },
  /** Étalonnage final (Hd2dPost) : vif pour la HD-2D, naturel pour la 3D réaliste. */
  post: {
    hd2d: {
      bloom: [0.48, 0.8],
      saturation: 1.14,
      shadowTint: 0.22,
      lightTint: 0.18,
      exposure: 1.06,
      sky: { top: '#6fa9f5', middle: '#b9dcff', horizon: '#fff1d0' },
    },
    natural: {
      bloom: [0.84, 0.99],
      saturation: 1.04,
      shadowTint: 0.1,
      lightTint: 0.1,
      exposure: 1.04,
      // Ciel franchement bleu jusqu'en bas : la barre de navigation blanche s'en détache.
      sky: { top: '#2f6fd0', middle: '#5f9ce8', horizon: '#8fc0f2' },
    },
  },
} as const;

export type PostLook = (typeof explorerArt.post)[keyof typeof explorerArt.post];

export type ExplorerRamp = keyof typeof explorerArt.ramps;
