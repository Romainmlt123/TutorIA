import { colors, palette, shadow, subjects } from './tokens.generated';

/**
 * Les deux espaces de l'app : élève en bleu (tutoiement), parent en violet (vouvoiement).
 * Les boutons principaux, les étapes, les cases et les interrupteurs prennent la couleur de l'espace.
 * Dégradés repris des maquettes L1 à L6 : Français pour l'élève, Physique-Chimie pour le parent.
 */
export const spaces = {
  student: {
    gradient: subjects.francais.gradient,
    primary: colors.primary,
    ink: palette.blue[600],
    soft: palette.blue[100],
    track: palette.blue[200],
    shadow: shadow.brand,
    focus: shadow.focus,
  },
  parent: {
    gradient: subjects['physique-chimie'].gradient,
    primary: colors.accent,
    ink: palette.violet[600],
    soft: palette.violet[100],
    track: palette.violet[200],
    // Ombre du bouton principal violet (design system) : violet-500 à 30 %.
    shadow: '0 8px 20px rgba(102,46,230,0.30)',
    focus: '0 0 0 3px rgba(102,46,230,0.35)',
  },
} as const;

export type SpaceTone = keyof typeof spaces;
export type SpaceTheme = (typeof spaces)[SpaceTone];
