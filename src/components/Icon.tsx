import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { theme } from '@/theme';

type Shape =
  | { d: string }
  | { rect: readonly [x: number, y: number, width: number, height: number, rx: number] }
  | { circle: readonly [cx: number, cy: number, r: number] };

/** Jeu d'icônes au contour (grille 24), tracés repris des maquettes (design/screens). */
const ICONS = {
  accueil: [{ d: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' }],
  boussole: [{ d: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM15.5 8.5l-2 5-5 2 2-5z' }],
  revisions: [{ rect: [8, 3, 12, 15, 2] }, { d: 'M5 7v11a3 3 0 0 0 3 3h8' }],
  stats: [
    { d: 'M3 21h18' },
    { rect: [5, 11, 3, 7, 1] },
    { rect: [10.5, 5, 3, 13, 1] },
    { rect: [16, 14, 3, 4, 1] },
  ],
  cloche: [{ d: 'M6 16v-5a6 6 0 1 1 12 0v5l2 2H4z' }, { d: 'M10 21h4' }],
  reglages: [
    { d: 'M4 7h10M18 7h2M4 17h2M10 17h10' },
    { circle: [16, 7, 2] },
    { circle: [8, 17, 2] },
  ],
  'fleche-droite': [{ d: 'M5 12h14M13 6l6 6-6 6' }],
  'chevron-gauche': [{ d: 'M15 5l-7 7 7 7' }],
  croix: [{ d: 'M6 6l12 12M18 6 6 18' }],
  envoi: [{ d: 'M12 19V5M6 11l6-6 6 6' }],
  micro: [{ rect: [9, 3, 6, 11, 3] }, { d: 'M5 11a7 7 0 0 0 14 0M12 18v3' }],
  'micro-barre': [{ rect: [9, 3, 6, 11, 3] }, { d: 'M5 11a7 7 0 0 0 14 0M12 18v3M4 4l16 16' }],
  camera: [{ rect: [3, 6, 12, 12, 2] }, { d: 'M15 10l6-3v10l-6-3z' }],
  'camera-barree': [{ rect: [3, 6, 12, 12, 2] }, { d: 'M15 10l6-3v10l-6-3zM3 3l18 18' }],
  clavier: [{ rect: [2, 6, 20, 12, 2] }, { d: 'M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10' }],
  ampoule: [
    {
      d: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z',
    },
  ],
  flamme: [
    {
      d: 'M12 2.5c1 3.2 5.5 5.6 5.5 10.5a5.5 5.5 0 0 1-11 0c0-2.2 1-3.8 2.2-4.9 0 2.1 1 3.3 2.1 3.3 0-3.3-1-5.4 1.2-8.9z',
    },
  ],
  etoile: [{ d: 'M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9z' }],
  horloge: [{ circle: [12, 12, 9] }, { d: 'M12 7v5l3 2' }],
  cible: [{ circle: [12, 12, 9] }, { circle: [12, 12, 5] }, { circle: [12, 12, 1] }],
  'tendance-haut': [{ d: 'M3 17l6-6 4 4 8-8M15 7h6v6' }],
  coche: [{ d: 'M5 12.5 10 17l9-10' }],
  retour: [
    { d: 'M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5' },
  ],
  drapeau: [{ d: 'M5 21V4M5 4h11l-2 4 2 4H5' }],
  calculatrice: [
    { rect: [5, 3, 14, 18, 2] },
    { d: 'M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01' },
  ],
  livre: [{ d: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z' }, { d: 'M4 21V5M8 7h7M8 11h5' }],
  globe: [{ circle: [12, 12, 9] }, { d: 'M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18' }],
  langues: [
    { d: 'M4 5h9M8.5 3v2M11 5c-1 4-3.5 7-7 8.5M6 8.5c1.5 2.5 3.5 4 6 5' },
    { d: 'M13 21l4-9 4 9M14.5 18h5' },
  ],
  feuille: [{ d: 'M5 19c0-8 5-14 15-15-1 10-7 15-15 15z' }, { d: 'M5 19l8-8' }],
  fiole: [
    { d: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3' },
    { d: 'M7.5 15h9' },
  ],
  // Connexion, onboarding et espace Parents (design-system/bundle.js et maquettes L, E, O, P).
  casquette: [{ d: 'M2 9l10-5 10 5-10 5zM6 11.5v4.5c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 9v5' }],
  famille: [
    {
      d: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5M16 3.5a4 4 0 0 1 0 7M18 15.8c2 .8 3.4 2.6 4 5.2',
    },
  ],
  oeil: [
    { d: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' },
  ],
  'oeil-barre': [
    {
      d: 'M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.9 8.3 2 12 2 12s3.6 7 10 7c1.9 0 3.6-.6 5-1.5M9.9 9.9a3 3 0 0 0 4.2 4.2',
    },
  ],
  cadenas: [{ d: 'M6 11h12v10H6zM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11' }],
  cle: [{ d: 'M15 7a4 4 0 1 1-3.9 4.9L4 19v2h3v-2h2v-2h2l1.1-1.1A4 4 0 0 1 15 7zM16 10h.01' }],
  utilisateur: [{ d: 'M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM4 21c1-4 4.5-6 8-6s7 2 8 6' }],
  email: [{ d: 'M4 6h16v12H4zM4 7l8 6 8-6' }],
  partage: [{ d: 'M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5' }],
  telephone: [
    { d: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2' },
  ],
  lien: [
    {
      d: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
    },
  ],
  bouclier: [{ d: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4' }],
  alerte: [{ d: 'M12 3 2 20h20zM12 10v4M12 17h.01' }],
  fusee: [
    {
      d: 'M5 15c-1.5 1.5-2 4-2 6 2 0 4.5-.5 6-2M9 15l-3-3c1-4 4.5-8 12-9-1 7.5-5 11-9 12zM14.5 9.5h.01',
    },
  ],
  medaille: [{ d: 'M8 3h8l-2 6h-4zM12 9a6 6 0 1 1 0 12 6 6 0 0 1 0-12zM12 13v4' }],
  soleil: [
    {
      d: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
    },
  ],
  lune: [{ d: 'M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z' }],
  calendrier: [{ d: 'M5 5h14v15H5zM5 10h14M9 3v4M15 3v4' }],
  plus: [{ d: 'M12 5v14M5 12h14' }],
  moins: [{ d: 'M5 12h14' }],
  'chevron-droit': [{ d: 'M9 6l6 6-6 6' }],
  'chevron-bas': [{ d: 'M6 9l6 6 6-6' }],
  'chevron-haut': [{ d: 'M6 15l6-6 6 6' }],
  sessions: [
    {
      d: 'M21 11.5a8.5 8.5 0 0 1-12.4 7.6L4 20l1-4.3A8.5 8.5 0 1 1 21 11.5zM8.5 10h7M8.5 13.5h4.5',
    },
  ],
  'bulle-chat': [{ d: 'M4 5h16v11H9l-5 4z' }],
  graphique: [{ d: 'M4 4v16h16M7 15l4-5 3 3 5-6' }],
  cartes: [
    {
      d: 'M8 3h11a2 2 0 0 1 2 2v11M5 7h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z',
    },
  ],
  sortie: [{ d: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3' }],
  telechargement: [{ d: 'M12 3v12M7 10l5 5 5-5M5 19h14' }],
  poubelle: [{ d: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3' }],
  de: [
    { rect: [4, 4, 16, 16, 3] },
    { d: 'M8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01' },
  ],
} as const satisfies Record<string, readonly Shape[]>;

export type IconName = keyof typeof ICONS;

/** Icônes pleines par défaut (la flamme de la série). */
const FILLED_BY_DEFAULT: readonly IconName[] = ['flamme'];

export type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  /** Contour (par défaut) ou forme pleine (flamme, étoile du niveau). */
  variant?: 'stroke' | 'fill';
};

/** Icône décorative : le libellé d'accessibilité est porté par le bouton qui la contient. */
export function Icon({
  name,
  size = 24,
  color = theme.palette.gray[400],
  strokeWidth = 1.75,
  variant,
}: IconProps) {
  const filled = (variant ?? (FILLED_BY_DEFAULT.includes(name) ? 'fill' : 'stroke')) === 'fill';
  const paint = filled
    ? { fill: color, stroke: 'none' }
    : {
        fill: 'none',
        stroke: color,
        strokeWidth,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
      };
  // La vue porte le masquage d'accessibilité et garde l'icône au-dessus des fonds positionnés (web).
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, pointerEvents: 'none' }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        {ICONS[name].map((shape: Shape, index) => {
          if ('d' in shape) return <Path key={index} d={shape.d} {...paint} />;
          if ('rect' in shape) {
            const [x, y, width, height, rx] = shape.rect;
            return (
              <Rect key={index} x={x} y={y} width={width} height={height} rx={rx} {...paint} />
            );
          }
          const [cx, cy, r] = shape.circle;
          return <Circle key={index} cx={cx} cy={cy} r={r} {...paint} />;
        })}
      </Svg>
    </View>
  );
}
