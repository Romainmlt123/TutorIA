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
  sky: { top: '#6fa9f5', middle: '#b9dcff', horizon: '#fff1d0' },
  light: { sun: '#ffe2a8', skyFill: '#dbeaff', groundFill: '#8a73c9', rim: '#bff0ff' },
  grade: { shadows: '#9c8ce0', highlights: '#ffe6b8' },
  crystals: ['#62e6f0', '#b98cff', '#74b4ff'],
  dust: '#fff0c8',
  fog: '#d6e8ff',
} as const;

export type ExplorerRamp = keyof typeof explorerArt.ramps;
