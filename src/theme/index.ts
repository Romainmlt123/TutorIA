import { layout } from './layout';
import {
  colors,
  game,
  goal,
  gradientAngle,
  hero,
  kpi,
  navigation,
  onColor,
  palette,
  radius,
  screenBand,
  sectionTitle,
  settingTiles,
  shadow,
  space,
  statuses,
  subjects,
  typeScale,
  voice,
  voiceCall,
} from './tokens.generated';
import { spaces } from './spaces';

/**
 * Thème unique de l'app, partagé par l'espace élève et l'espace Parents (`spaces`).
 * Construire les écrans avec les rôles (`colors.primary`) plutôt qu'avec les nuances (`palette.blue[500]`).
 */
export const theme = {
  colors,
  palette,
  space,
  radius,
  shadow,
  typeScale,
  subjects,
  gradientAngle,
  game,
  kpi,
  voice,
  onColor,
  navigation,
  layout,
  hero,
  statuses,
  settingTiles,
  spaces,
  /** v2.5 : bandeau de marque, titres de section dans leur carte, objectif du jour. */
  screenBand,
  sectionTitle,
  goal,
  /** v2.6 : appel vocal plein écran. */
  voiceCall,
} as const;

export type Theme = typeof theme;
export type ColorRole = keyof typeof colors;
export type SubjectId = keyof typeof subjects;
export type StatusId = Exclude<keyof typeof statuses, 'sessionOutcome'>;
export type SettingTileId = keyof typeof settingTiles;
export type Gradient = {
  readonly colors: readonly string[];
  readonly locations: readonly number[];
};

export {
  fontFamily,
  fontFamilyFor,
  fontSources,
  gameFontFamily,
  type FontWeightName,
} from './fonts';
export { angleToPoints } from './gradients';
export * as extras from './extras';
export { subjectTheme, type SubjectTheme } from './subjects';
export { type SpaceTheme, type SpaceTone } from './spaces';
export { textStyle, type TypeVariant } from './typography';
