import type { TextStyle } from 'react-native';

import { fontFamilyFor, weightFromNumber, type FontWeightName } from './fonts';
import { typeScale } from './tokens.generated';

/**
 * Styles propres à l'app, relevés sur les maquettes et absents de l'échelle des tokens :
 * - `title` (24/32 Black : série, niveau, question de flashcard) ;
 * - `hint` (13/18 : aide sous un champ, règles du mot de passe, raison d'un choix) ;
 * - `lead` (15/22 : phrase d'en-tête des écrans de connexion, résumés de l'espace Parents) ;
 * - `heading` (28/34 Black : titres des écrans de connexion et d'onboarding) ;
 * - `splash` (36/40 Black : titre de bienvenue, L1) ;
 * - `section` (18/24 Black : titres de section de la connexion et de l'espace Parents) ;
 * - `cardTitle` (17/22 Black : matière d'une auto-évaluation, carte de l'espace Parents) ;
 * - `rowTitle` (16/22 Black : ligne de choix, étape d'un plan) ;
 * - `metric` (20/24 Black : durée choisie) · `stat` (26/30 Black) · `hero` (30/36 Black).
 */
const appTypeScale = {
  title: { fontSize: 24, lineHeight: 32, fontWeight: 900, letterSpacing: 0 },
  hint: { fontSize: 13, lineHeight: 18, fontWeight: 400, letterSpacing: 0 },
  lead: { fontSize: 15, lineHeight: 22, fontWeight: 400, letterSpacing: 0 },
  heading: { fontSize: 28, lineHeight: 34, fontWeight: 900, letterSpacing: 0 },
  splash: { fontSize: 36, lineHeight: 40, fontWeight: 900, letterSpacing: -0.36 },
  section: { fontSize: 18, lineHeight: 24, fontWeight: 900, letterSpacing: 0 },
  cardTitle: { fontSize: 17, lineHeight: 22, fontWeight: 900, letterSpacing: 0 },
  rowTitle: { fontSize: 16, lineHeight: 22, fontWeight: 900, letterSpacing: 0 },
  metric: { fontSize: 20, lineHeight: 24, fontWeight: 900, letterSpacing: 0 },
  stat: { fontSize: 26, lineHeight: 30, fontWeight: 900, letterSpacing: 0 },
  hero: { fontSize: 30, lineHeight: 36, fontWeight: 900, letterSpacing: 0 },
} as const;

const scale = { ...typeScale, ...appTypeScale };

export type TypeVariant = keyof typeof scale;

export type TextStyleOptions = {
  /** Remplace la graisse par défaut du style (ex. titre de page : h2 en Black). */
  weight?: FontWeightName;
  italic?: boolean;
};

/**
 * Style typographique complet d'une variante des tokens.
 * `fontWeight` n'est jamais défini : la graisse est portée par la famille Satoshi.
 */
export function textStyle(variant: TypeVariant, options: TextStyleOptions = {}): TextStyle {
  const token = scale[variant];
  const weight = options.weight ?? weightFromNumber(token.fontWeight);
  return {
    fontFamily: fontFamilyFor(weight, options.italic),
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    letterSpacing: token.letterSpacing,
    ...(variant === 'overline' ? { textTransform: 'uppercase' } : null),
  };
}
