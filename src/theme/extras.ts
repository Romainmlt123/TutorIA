import { colors, palette, shadow, type subjects } from './tokens.generated';

type SubjectKey = keyof typeof subjects;

/*
 * Compléments relevés sur les maquettes (design/screens/*.dc.html) et absents de app-tokens.json.
 * Toujours exprimés à partir de la palette.
 */

/** Barres « Progression par matière » (04-Stats), dégradé horizontal. */
export const subjectProgressGradient: Record<SubjectKey, readonly [string, string]> = {
  maths: [palette.red[400], palette.red[600]],
  francais: [palette.blue[400], palette.blue[600]],
  'histoire-geo': [palette.green[500], palette.green[700]],
  anglais: [palette.cyan[500], palette.cyan[700]],
  svt: [palette.orange[600], palette.orange[800]],
  'physique-chimie': [palette.violet[400], palette.violet[600]],
};

/** Calendrier d'activité (04-Stats) : 5 niveaux de bleu, du plus faible au plus fort. */
export const heatmapLevels = [
  palette.blue[100],
  palette.blue[200],
  palette.blue[300],
  palette.blue[500],
  palette.blue[700],
] as const;

/** Histogramme du temps d'étude (04-Stats) : violet en haut, bleu en bas. */
export const chartBarGradient = [palette.violet[500], palette.blue[500]] as const;

/** Ombre violette du bouton « C'est parti » (03a) : violet-500 à 30 %. */
export const vividShadow = '0 8px 20px rgba(102,46,230,0.30)';

/** Piste de la jauge d'XP sur la carte Niveau (01-Accueil) : blanc à 18 %. */
export const onColorTrackSoft = 'rgba(255,255,255,0.18)';

/** Anneau de sélection d'une carte matière (03a) : bord couleur du fond, puis encre de la matière. */
export function selectionRing(ink: string): string {
  return `0 0 0 3px ${colors.bg}, 0 0 0 6px ${ink}, ${shadow.lg}`;
}

/** Opacités des icônes en filigrane sur les cartes colorées. */
export const watermarkOpacity = { subject: 0.16, streak: 0.22, level: 0.12, goal: 0.14 } as const;

/** Opacités du blanc sur la carte « Évolution de ta maîtrise » (04-Stats). */
export const chartOnColorOpacity = {
  grid: 0.3,
  baseline: 0.5,
  label: 0.85,
  areaTop: 0.35,
} as const;

/** Ombre du rond blanc de l'interrupteur (design-system › Switch). */
export const switchKnobShadow = '0 1px 3px rgba(9,17,34,0.25)';

/** Ombre de la classe choisie dans la grille violette de L5 : violet-500 à 25 %. */
export const parentChipShadow = '0 6px 14px rgba(102,46,230,0.25)';

/** Cercles décoratifs de la carte « Ton parcours est prêt » (O5) : blanc à 10 %. */
export const heroCircle = 'rgba(255,255,255,0.10)';

/** Voile derrière une fenêtre de choix (choix de l'enfant) : encre à 40 %. */
export const backdrop = 'rgba(0,6,18,0.40)';

/** Piste de l'anneau de maîtrise globale (P2) : blanc à 22 %. */
export const ringTrackOnColor = 'rgba(255,255,255,0.22)';

/** Encadré de confidentialité sur la carte « Cette semaine » (P3) : blanc à 14 %. */
export const privacyVeil = 'rgba(255,255,255,0.14)';

/**
 * Idées de départ d'une discussion libre (tuteur écrit) : couleurs d'accent de la palette, assez
 * foncées pour un texte blanc.
 */
export const chatStarterGradients = {
  notion: [palette.violet[500], palette.violet[700]],
  exercise: [palette.orange[500], palette.orange[700]],
  review: [palette.green[600], palette.green[800]],
  graph: [palette.cyan[600], palette.cyan[800]],
} as const;

/** Pilules décoratives du bandeau de marque (v2.5) : blanc à 8 % et à 6 %. */
export const bandPills = ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.06)'] as const;

/** Appel vocal plein écran (v2.6) : ombres, halos et voiles relevés sur les maquettes 2B à 2F. */
export const call = {
  avatarShadow: '0 12px 28px rgba(3,39,110,0.35)',
  /** Ombre au sol du logo qui rebondit. */
  ground: 'rgba(3,39,110,0.35)',
  /** Halo blanc derrière le logo : deux disques, du plus proche au plus large. */
  halo: ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.06)'],
  hangupShadow: '0 8px 20px rgba(194,26,26,0.35)',
  visualShadow: '0 16px 36px rgba(3,39,110,0.35)',
  /** « TUTOR'IA » ou « TOI » au-dessus des sous-titres. */
  speaker: 'rgba(255,255,255,0.80)',
  /** Libellés sous les commandes. */
  label: 'rgba(255,255,255,0.90)',
  /** Liseré et lueur des pastilles d'état colorées. */
  statusRing: 'rgba(255,255,255,0.28)',
  speakingGlow: '0 6px 18px rgba(12,158,66,0.45)',
  listeningGlow: '0 6px 18px rgba(194,26,26,0.45)',
} as const;

/** Couleurs officielles du « G » de Google, pour le bouton « Continuer avec Google » (v2.7). */
export const googleLogo = {
  blue: '#4285F4',
  green: '#34A853',
  yellow: '#FBBC05',
  red: '#EA4335',
} as const;
