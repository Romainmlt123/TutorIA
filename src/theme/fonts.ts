import type { FontSource } from 'expo-font';

/**
 * Satoshi : une famille par graisse et par style (noms = noms PostScript des fichiers).
 * C'est la seule façon fiable d'obtenir la bonne graisse sur iOS, Android et le web :
 * ne jamais combiner ces familles avec `fontWeight`, sinon Android et le web simulent un faux gras.
 */
export const fontWeights = ['light', 'regular', 'medium', 'bold', 'black'] as const;
export type FontWeightName = (typeof fontWeights)[number];

export const fontFamily = {
  light: 'Satoshi-Light',
  lightItalic: 'Satoshi-LightItalic',
  regular: 'Satoshi-Regular',
  regularItalic: 'Satoshi-Italic',
  medium: 'Satoshi-Medium',
  mediumItalic: 'Satoshi-MediumItalic',
  bold: 'Satoshi-Bold',
  boldItalic: 'Satoshi-BoldItalic',
  black: 'Satoshi-Black',
  blackItalic: 'Satoshi-BlackItalic',
} as const;

export function fontFamilyFor(weight: FontWeightName, italic = false): string {
  const key: keyof typeof fontFamily = italic ? `${weight}Italic` : weight;
  return fontFamily[key];
}

/** Graisse numérique des tokens (300 à 900) → nom de graisse Satoshi. */
export function weightFromNumber(weight: number): FontWeightName {
  if (weight >= 900) return 'black';
  if (weight >= 700) return 'bold';
  if (weight >= 500) return 'medium';
  if (weight >= 400) return 'regular';
  return 'light';
}

export const fontSources: Record<string, FontSource> = {
  [fontFamily.light]: require('../../assets/typographie/Satoshi_Complete/Fonts/OTF/Satoshi-Light.otf'),
  [fontFamily.lightItalic]: require('../../assets/typographie/Satoshi_Complete/Fonts/OTF/Satoshi-LightItalic.otf'),
  [fontFamily.regular]: require('../../assets/typographie/Satoshi_Complete/Fonts/OTF/Satoshi-Regular.otf'),
  [fontFamily.regularItalic]: require('../../assets/typographie/Satoshi_Complete/Fonts/OTF/Satoshi-Italic.otf'),
  [fontFamily.medium]: require('../../assets/typographie/Satoshi_Complete/Fonts/OTF/Satoshi-Medium.otf'),
  [fontFamily.mediumItalic]: require('../../assets/typographie/Satoshi_Complete/Fonts/OTF/Satoshi-MediumItalic.otf'),
  [fontFamily.bold]: require('../../assets/typographie/Satoshi_Complete/Fonts/OTF/Satoshi-Bold.otf'),
  [fontFamily.boldItalic]: require('../../assets/typographie/Satoshi_Complete/Fonts/OTF/Satoshi-BoldItalic.otf'),
  [fontFamily.black]: require('../../assets/typographie/Satoshi_Complete/Fonts/OTF/Satoshi-Black.otf'),
  [fontFamily.blackItalic]: require('../../assets/typographie/Satoshi_Complete/Fonts/OTF/Satoshi-BlackItalic.otf'),
};
